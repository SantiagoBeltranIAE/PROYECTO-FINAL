<?php
header('Content-Type: application/json; charset=utf-8');

$possible = [
  __DIR__ . '/../../admin/backend/config/conexion.php',
  __DIR__ . '/../db.php',
  __DIR__ . '/../../db.php',
];
$loaded = false;
foreach ($possible as $p) { if (file_exists($p)) { require_once $p; $loaded = true; break; } }
if (!$loaded) { http_response_code(500); echo json_encode(['ok'=>false,'msg'=>'Conexión no encontrada']); exit; }

$id = $_GET['id'] ?? $_GET['id_pedido'] ?? $_GET['order'] ?? null;
if (!$id) { http_response_code(400); echo json_encode(['ok'=>false,'msg'=>'id requerido']); exit; }

$tableCandidates = ['pedido','pedidos','compra','purchase'];
$foundTable = null;
foreach ($tableCandidates as $t) {
  if (isset($mysqli)) {
    $r = $mysqli->query("SHOW TABLES LIKE '".$mysqli->real_escape_string($t)."'");
    if ($r && $r->num_rows) { $foundTable = $t; break; }
  } else {
    try { $stmt = $db->prepare("SHOW TABLES LIKE ?"); $stmt->execute([$t]); if ($stmt->fetch()) { $foundTable = $t; break; } } catch(Exception $e) {}
  }
}
if (!$foundTable) { http_response_code(500); echo json_encode(['ok'=>false,'msg'=>'Tabla pedidos no encontrada']); exit; }

try {
  // obtener columnas de la tabla para saber qué id usar
  if (isset($mysqli)) {
    $colsRes = $mysqli->query("SHOW COLUMNS FROM `{$foundTable}`");
    $cols = [];
    while ($c = $colsRes->fetch_assoc()) $cols[] = $c['Field'];
  } else {
    $stmt = $db->query("SHOW COLUMNS FROM `{$foundTable}`");
    $cols = $stmt->fetchAll(PDO::FETCH_COLUMN);
  }

  $idCandidates = ['id_pedidos','id_pedido','id','pedido_id','idPedido'];
  $idCols = array_values(array_intersect($idCandidates, $cols));
  if (empty($idCols)) {
    http_response_code(500);
    echo json_encode(['ok'=>false,'msg'=>'No se encontró columna identificadora (id_pedidos / id_pedido / id) en la tabla.','cols'=>$cols]);
    exit;
  }

  // construir WHERE dinámico y bind params
  $whereParts = [];
  $params = [];
  foreach ($idCols as $c) { $whereParts[] = "`{$c}` = ?"; $params[] = $id; }
  $where = implode(' OR ', $whereParts);

  if (isset($mysqli)) {
    $sql = "SELECT * FROM `{$foundTable}` WHERE {$where} LIMIT 1";
    $stmt = $mysqli->prepare($sql);
    $types = str_repeat('s', count($params));
    $refs = [];
    $refs[] = & $types;
    foreach ($params as $k => $v) $refs[] = & $params[$k];
    call_user_func_array([$stmt, 'bind_param'], $refs);
    $stmt->execute();
    $res = $stmt->get_result()->fetch_assoc();
    $stmt->close();
  } else {
    $sql = "SELECT * FROM `{$foundTable}` WHERE {$where} LIMIT 1";
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $res = $stmt->fetch(PDO::FETCH_ASSOC);
  }

  if (!$res) { echo json_encode(['ok'=>false,'msg'=>'not found']); exit; }

  echo json_encode([
    'ok' => true,
    'id' => $res['id_pedidos'] ?? $res['id_pedido'] ?? $res['id'] ?? null,
    'estado' => $res['estado'] ?? $res['status'] ?? null,
    'total' => $res['total'] ?? $res['monto'] ?? null,
    'cliente' => $res['cliente'] ?? $res['nombre'] ?? null,
    'telefono' => $res['telefono'] ?? $res['tel'] ?? null,
    'direccion' => $res['direccion'] ?? $res['direccion_entrega'] ?? null,
    'items' => $res['items'] ?? $res['detalle'] ?? null,
    'created_at' => $res['created_at'] ?? $res['fecha'] ?? null,
  ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['ok'=>false,'msg'=>'DB error','error'=>$e->getMessage()]);
}