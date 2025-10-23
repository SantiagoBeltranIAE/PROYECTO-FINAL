<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../config/conexion.php';

$in = json_decode(file_get_contents('php://input'), true);
if (!$in || !isset($in['cliente']) || !is_array($in['items'])) {
  http_response_code(400); echo json_encode(['ok'=>false,'msg'=>'payload']); exit;
}

$cl = $in['cliente'];
$items = array_values(array_filter($in['items'], fn($x)=> (int)($x['cantidad']??0) > 0));
if (!$items) { http_response_code(400); echo json_encode(['ok'=>false,'msg'=>'sin items']); exit; }

$nombre = trim($cl['nombre']??'');
$tel    = trim($cl['telefono']??'');
$dir    = trim($cl['direccion']??'');
$ref    = trim($cl['referencia']??'');

$total = 0.0;
foreach ($items as $it) $total += (float)($it['precio_unitario']??0) * (int)$it['cantidad'];

// Inserta en pedidos (ajusta columnas si difieren)
$stmt = $mysqli->prepare("INSERT INTO pedidos (cliente_nombre, telefono, direccion, referencia, total, estado, fecha_hora) VALUES (?,?,?,?,?,'pendiente',NOW())");
$stmt->bind_param('ssssd', $nombre, $tel, $dir, $ref, $total);
if (!$stmt->execute()) { http_response_code(500); echo json_encode(['ok'=>false,'msg'=>$stmt->error]); exit; }
$idPedido = $mysqli->insert_id;

// Inserta detalle en pedido_detalle
$stmtD = $mysqli->prepare("INSERT INTO pedido_detalle (id_pedido, cantidad, precio_unitario, producto_nombre) VALUES (?,?,?,?)");
foreach ($items as $it) {
  $cant = (int)$it['cantidad'];
  $precio = (float)($it['precio_unitario'] ?? 0);
  $nom = (string)($it['producto_nombre'] ?? $it['nombre'] ?? 'Producto');
  $stmtD->bind_param('iids', $idPedido, $cant, $precio, $nom);
  $stmtD->execute();
}

echo json_encode(['ok'=>true,'id_pedido'=>$idPedido]);