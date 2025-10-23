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

$body = json_decode(file_get_contents('php://input'), true) ?: $_POST;
$id = $body['id'] ?? null;
$estado = $body['estado'] ?? null;
if (!$id || !$estado) { http_response_code(400); echo json_encode(['ok'=>false,'msg'=>'id y estado requeridos']); exit; }

$tableCandidates = ['pedido','pedidos','compra','purchase'];
$found = null;
foreach ($tableCandidates as $t) {
  if (isset($mysqli)) {
    $r = $mysqli->query("SHOW TABLES LIKE '".$mysqli->real_escape_string($t)."'");
    if ($r && $r->num_rows) { $found = $t; break; }
  } else {
    try { $stmt = $db->prepare("SHOW TABLES LIKE ?"); $stmt->execute([$t]); if ($stmt->fetch()) { $found = $t; break; } } catch(Exception $e) {}
  }
}
if (!$found) { http_response_code(500); echo json_encode(['ok'=>false,'msg'=>'Tabla pedidos no encontrada']); exit; }

try {
  // obtener columnas para saber que id usar
  if (isset($mysqli)) {
    $colsRes = $mysqli->query("SHOW COLUMNS FROM `{$found}`");
    $cols = [];
    while ($c = $colsRes->fetch_assoc()) $cols[] = $c['Field'];
  } else {
    $stmt = $db->query("SHOW COLUMNS FROM `{$found}`");
    $cols = $stmt->fetchAll(PDO::FETCH_COLUMN);
  }

  $idCandidates = ['id_pedidos','id_pedido','id','pedido_id','idPedido'];
  $idCols = array_values(array_intersect($idCandidates, $cols));
  if (empty($idCols)) { http_response_code(500); echo json_encode(['ok'=>false,'msg'=>'No se encontró columna id en la tabla pedidos','cols'=>$cols]); exit; }

  // construir WHERE dinámico
  $whereParts = []; $params = [];
  foreach ($idCols as $c) { $whereParts[] = "`{$c}` = ?"; $params[] = $id; }
  $where = implode(' OR ', $whereParts);

  if (isset($mysqli)) {
    $sql = "UPDATE `{$found}` SET estado = ? WHERE {$where} LIMIT 1";
    $stmt = $mysqli->prepare($sql);
    $types = 's' . str_repeat('s', count($params));
    $bind = [];
    $bind[] = & $types;
    $bind[] = & $estado;
    foreach ($params as $k => $v) $bind[] = & $params[$k];
    call_user_func_array([$stmt, 'bind_param'], $bind);
    if (!$stmt->execute()) throw new Exception($stmt->error);
    $stmt->close();
    if ($mysqli->query("SHOW TABLES LIKE 'meta'")->num_rows) {
      $mysqli->query("INSERT INTO meta (name,value) VALUES ('pedidos_version', NOW()) ON DUPLICATE KEY UPDATE value = NOW()");
    }
    echo json_encode(['ok'=>true]);
  } else {
    $sql = "UPDATE `{$found}` SET estado = :estado WHERE {$where} LIMIT 1";
    // PDO: build named params array
    $named = [':estado' => $estado];
    foreach ($idCols as $i => $col) { $named[":id{$i}"] = $id; $where = str_replace("?", ":id{$i}", $where, 1); }
    $stmt = $db->prepare("UPDATE `{$found}` SET estado = :estado WHERE {$where} LIMIT 1");
    $stmt->execute(array_values($named));
    try { $db->query("INSERT INTO meta (name,value) VALUES ('pedidos_version', NOW()) ON DUPLICATE KEY UPDATE value = NOW()"); } catch(Exception $e) {}
    echo json_encode(['ok'=>true]);
  }

} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['ok'=>false,'msg'=>$e->getMessage()]);
}