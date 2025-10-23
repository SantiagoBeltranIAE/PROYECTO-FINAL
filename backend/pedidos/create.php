<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate');

/* incluir la conexión (admin o local) */
$possible = [
  __DIR__ . '/../../admin/backend/config/conexion.php',
  __DIR__ . '/../db.php',
  __DIR__ . '/../../db.php',
];
$loaded = false;
foreach ($possible as $p) {
  if (file_exists($p)) { require_once $p; $loaded = true; break; }
}
if (!$loaded) {
  http_response_code(500);
  echo json_encode(['ok'=>false,'msg'=>'Archivo de conexión no encontrado. Rutas probadas: '.implode(', ',$possible)]);
  exit;
}

/* leer cuerpo de forma segura */
$raw = file_get_contents('php://input');
$body = null;
if ($raw !== '') {
  $body = json_decode($raw, true);
}
if ($body === null) {
  // fallback a form-data / x-www-form-urlencoded
  $body = $_POST ?: [];
}
if (!is_array($body)) $body = [];

/* normalizar campos */
$items   = $body['items'] ?? $body['cart'] ?? null;
$total   = $body['total'] ?? $body['amount'] ?? null;
$cliente = $body['cliente'] ?? $body['customer'] ?? ($body['nombre'] ?? null);
$telefono = $body['telefono'] ?? ($body['tel'] ?? null);
$direccion = $body['direccion'] ?? null;

/* validación mínima */
if (empty($items) || $total === null) {
  http_response_code(400);
  echo json_encode(['ok'=>false,'msg'=>'Datos de pedido incompletos (items/total).']);
  exit;
}
$items_json = is_string($items) ? $items : json_encode($items, JSON_UNESCAPED_UNICODE);

/* detectar tabla de pedidos existente */
$tablesToTry = ['pedido','pedidos','compra','purchase'];
$chosenTable = null;
if (isset($mysqli) && ($mysqli instanceof mysqli)) {
  foreach ($tablesToTry as $t) {
    $res = $mysqli->query("SHOW TABLES LIKE '".$mysqli->real_escape_string($t)."'");
    if ($res && $res->num_rows) { $chosenTable = $t; break; }
  }
} elseif (isset($db) && ($db instanceof PDO)) {
  foreach ($tablesToTry as $t) {
    $stmt = $db->prepare("SHOW TABLES LIKE ?");
    $stmt->execute([$t]);
    if ($stmt->fetch()) { $chosenTable = $t; break; }
  }
}

if (!$chosenTable) {
  http_response_code(500);
  echo json_encode(['ok'=>false,'msg'=>'No se encontró tabla de pedidos. Tablas probadas: '.implode(',', $tablesToTry)]);
  exit;
}

/* obtener columnas y mapear dinamicamente */
try {
  if (isset($mysqli)) {
    $colsRes = $mysqli->query("SHOW COLUMNS FROM `{$chosenTable}`");
    $cols = [];
    while ($c = $colsRes->fetch_assoc()) $cols[] = $c['Field'];
  } else {
    $stmt = $db->query("SHOW COLUMNS FROM `{$chosenTable}`");
    $cols = $stmt->fetchAll(PDO::FETCH_COLUMN);
  }

  $find = function(array $candidates) use ($cols) {
    foreach ($candidates as $c) if (in_array($c, $cols, true)) return $c;
    return null;
  };

  $col_cliente   = $find(['cliente','nombre','nombre_cliente','customer','cliente_nombre']);
  $col_items     = $find(['items','detalle','detalle_pedido','items_json','productos','cart']);
  $col_total     = $find(['total','monto','importe','precio_total','valor']);
  $col_estado    = $find(['estado','status','estado_pedido']);
  $col_telefono  = $find(['telefono','tel','telefono_cliente']);
  $col_direccion = $find(['direccion','direccion_entrega','address','direccion_cliente']);

  $insertCols = [];
  $insertVals = [];
  $types = '';

  if ($col_cliente)   { $insertCols[] = $col_cliente;   $insertVals[] = (is_array($cliente)? json_encode($cliente, JSON_UNESCAPED_UNICODE) : $cliente); $types .= 's'; }
  if ($col_telefono)  { $insertCols[] = $col_telefono;  $insertVals[] = $telefono; $types .= 's'; }
  if ($col_direccion) { $insertCols[] = $col_direccion; $insertVals[] = $direccion; $types .= 's'; }
  if ($col_items)     { $insertCols[] = $col_items;     $insertVals[] = $items_json; $types .= 's'; }
  if ($col_total)     { $insertCols[] = $col_total;     $insertVals[] = floatval($total); $types .= 'd'; }
  if ($col_estado)    { $insertCols[] = $col_estado;    $insertVals[] = 'pendiente'; $types .= 's'; }

  if (empty($insertCols)) {
    http_response_code(500);
    echo json_encode(['ok'=>false,'msg'=>'No se encontró ninguna columna útil para insertar en la tabla '.$chosenTable,'cols'=>$cols]);
    exit;
  }

  $placeholders = array_fill(0, count($insertCols), '?');
  $sql = "INSERT INTO `{$chosenTable}` (`".implode('`,`',$insertCols)."`) VALUES (".implode(',',$placeholders).")";

  if (isset($mysqli)) {
    $stmt = $mysqli->prepare($sql);
    if (!$stmt) throw new Exception($mysqli->error);
    $bindParams = [];
    $bindParams[] = & $types;
    for ($i=0;$i<count($insertVals);$i++) {
      // ensure variables are references
      $bindParams[] = & $insertVals[$i];
    }
    call_user_func_array([$stmt,'bind_param'],$bindParams);
    if (!$stmt->execute()) throw new Exception($stmt->error);
    $insertId = $mysqli->insert_id;
    $stmt->close();
    if ($mysqli->query("SHOW TABLES LIKE 'meta'")->num_rows) {
      $mysqli->query("INSERT INTO meta (name,value) VALUES ('pedidos_version', NOW()) ON DUPLICATE KEY UPDATE value = NOW()");
    }
    echo json_encode(['ok'=>true,'orderId'=>$insertId]);
    exit;
  } else {
    $pdoStmt = $db->prepare($sql);
    $pdoStmt->execute($insertVals);
    $insertId = $db->lastInsertId();
    try { $db->query("INSERT INTO meta (name,value) VALUES ('pedidos_version', NOW()) ON DUPLICATE KEY UPDATE value = NOW()"); } catch(Exception $e) {}
    echo json_encode(['ok'=>true,'orderId'=>$insertId]);
    exit;
  }

} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['ok'=>false,'msg'=>'DB error','error'=>$e->getMessage()]);
  exit;
}