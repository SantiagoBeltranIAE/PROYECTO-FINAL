<?php
// backend/pedidos/update_estado.php
require_once __DIR__."/../config/conexion.php";
require_once __DIR__."/../config/session.php";
exigir_auth();

$body = json_decode(file_get_contents("php://input"), true);
$id = intval($body["id_pedido"] ?? 0);
$estado = trim($body["estado"] ?? "");

if ($id <= 0 || $estado === "") {
  http_response_code(400);
  echo json_encode(["error" => "Datos inválidos"]);
  exit;
}

$mysqli->begin_transaction();
try {
  // actualizar estado del pedido
  $stmt = $mysqli->prepare("UPDATE pedido SET estado=? WHERE id_pedido=?");
  $stmt->bind_param("si", $estado, $id);
  $stmt->execute();

  // guardar historial
  $stmt2 = $mysqli->prepare("INSERT INTO pedido_historial (id_pedido, estado) VALUES (?, ?)");
  $stmt2->bind_param("is", $id, $estado);
  $stmt2->execute();

  $mysqli->commit();
  echo json_encode(["ok"=>true, "id_pedido"=>$id, "estado"=>$estado, "ahora"=>date("Y-m-d H:i:s")]);
} catch (Throwable $e) {
  $mysqli->rollback();
  http_response_code(500);
  echo json_encode(["error"=>"DB: ".$e->getMessage()]);
}
