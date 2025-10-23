<?php
// php/controllers/pedidos.php
// Crea pedido, detalles y primer historial. Devuelve id_pedido + tracking_code.

function crear_pedido($mysqli) {
  header("Content-Type: application/json; charset=utf-8");

  $body = json_decode(file_get_contents("php://input"), true);
  if (!$body) {
    http_response_code(400);
    echo json_encode(["ok"=>false, "error"=>"JSON inválido"]);
    return;
  }

  // Esperamos algo así:
  // {
  //   "cliente": {"nombre":"Thiago","telefono":"099...","direccion":"..."},
  //   "items": [ {"id_producto":1,"cantidad":2}, {"id_producto":5,"cantidad":1} ],
  //   "observaciones": "sin cebolla"
  // }

  $cliente = $body["cliente"] ?? [];
  $items   = $body["items"]   ?? [];
  $obs     = trim($body["observaciones"] ?? "");

  if (empty($items)) {
    http_response_code(400);
    echo json_encode(["ok"=>false, "error"=>"Faltan items"]);
    return;
  }

  // Normalizar cliente
  $cli_nombre   = trim($cliente["nombre"]    ?? "Cliente");
  $cli_telefono = trim($cliente["telefono"]  ?? "");
  $cli_dir      = trim($cliente["direccion"] ?? "");

  $mysqli->begin_transaction();
  try {
    // 1) Asegurar cliente (si tu tabla existe; si no, omití este bloque)
    $id_cliente = null;
    $tieneCliente = $mysqli->query("SHOW TABLES LIKE 'cliente'")->num_rows > 0;
    if ($tieneCliente) {
      // buscar por teléfono (o insertar)
      if ($cli_telefono !== "") {
        $stmt = $mysqli->prepare("SELECT id_cliente FROM cliente WHERE telefono=? LIMIT 1");
        $stmt->bind_param("s", $cli_telefono);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc();
        if ($row) $id_cliente = (int)$row["id_cliente"];
      }
      if (!$id_cliente) {
        $stmt = $mysqli->prepare("INSERT INTO cliente (nombre, telefono, direccion) VALUES (?, ?, ?)");
        $stmt->bind_param("sss", $cli_nombre, $cli_telefono, $cli_dir);
        $stmt->execute();
        $id_cliente = $stmt->insert_id;
      }
    }

    // 2) Calcular total consultando precios reales de producto
    $total = 0.0;
    $lineas = [];
    foreach ($items as $it) {
      $idp = (int)($it["id_producto"] ?? 0);
      $cant = (int)($it["cantidad"] ?? 0);
      if ($idp <= 0 || $cant <= 0) continue;

      $stmt = $mysqli->prepare("SELECT precio FROM producto WHERE id_producto=? LIMIT 1");
      $stmt->bind_param("i", $idp);
      $stmt->execute();
      $prod = $stmt->get_result()->fetch_assoc();
      if (!$prod) continue;

      $precio = (float)$prod["precio"];
      $sub = $precio * $cant;
      $total += $sub;
      $lineas[] = ["id_producto"=>$idp, "cantidad"=>$cant, "precio"=>$precio, "subtotal"=>$sub];
    }
    if (!$lineas) {
      http_response_code(400);
      echo json_encode(["ok"=>false, "error"=>"No se encontraron productos válidos"]);
      $mysqli->rollback();
      return;
    }

    // 3) Insert pedido
    // Columnas típicas: id_pedido, id_cliente (nullable), estado, total, fecha_hora, observaciones, tracking_code
    $estado_inicial = "confirmado"; // o "nuevo" si preferís
    $stmt = $mysqli->prepare("INSERT INTO pedido (id_cliente, estado, total, fecha_hora, observaciones)
                              VALUES (?, ?, ?, NOW(), ?)");
    if ($tieneCliente) {
      $stmt->bind_param("isds", $id_cliente, $estado_inicial, $total, $obs);
    } else {
      // si no existe tabla cliente
      $null = null;
      $stmt->bind_param("isds", $null, $estado_inicial, $total, $obs);
    }
    $stmt->execute();
    $id_pedido = $stmt->insert_id;

    // 4) tracking_code bonito
    $tracking = "P".str_pad((string)$id_pedido, 6, "0", STR_PAD_LEFT);
    $stmt = $mysqli->prepare("UPDATE pedido SET tracking_code=? WHERE id_pedido=?");
    $stmt->bind_param("si", $tracking, $id_pedido);
    $stmt->execute();

    // 5) Detalle
    $stmt = $mysqli->prepare("INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad, subtotal)
                              VALUES (?, ?, ?, ?)");
    foreach ($lineas as $ln) {
      $sub = $ln["subtotal"];
      $stmt->bind_param("iiid", $id_pedido, $ln["id_producto"], $ln["cantidad"], $sub);
      $stmt->execute();
    }

    // 6) Historial
    $stmt = $mysqli->prepare("INSERT INTO pedido_historial (id_pedido, estado) VALUES (?, ?)");
    $stmt->bind_param("is", $id_pedido, $estado_inicial);
    $stmt->execute();

    $mysqli->commit();
    echo json_encode([
      "ok"=>true,
      "id_pedido"=>$id_pedido,
      "tracking_code"=>$tracking,
      "total"=>$total,
      "estado"=>$estado_inicial
    ]);
  } catch (Throwable $e) {
    $mysqli->rollback();
    http_response_code(500);
    echo json_encode(["ok"=>false, "error"=>"DB: ".$e->getMessage()]);
  }
}
