<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../config/conexion.php';

if (!isset($mysqli) || !($mysqli instanceof mysqli)) { http_response_code(500); echo json_encode(['ok'=>false,'msg'=>'Sin conexión']); exit; }

function tExists(mysqli $db, string $t){ $r=$db->query("SHOW TABLES LIKE '".$db->real_escape_string($t)."'"); return $r && $r->num_rows>0; }
function cols(mysqli $db, string $t){ $r=$db->query("SHOW COLUMNS FROM `$t`"); $o=[]; if($r) while($x=$r->fetch_assoc()) $o[$x['Field']]=true; return $o; }
function pick($C,$a){ foreach($a as $x) if(isset($C[$x])) return $x; return null; }
function norm_estado(string $s): string {
  $e = strtolower(trim($s));
  $e = strtr($e, [' '=>'_', '-'=>'_']);
  $map = [
    'confirmado'=>'aceptado','aprobado'=>'aceptado',
    'preparando'=>'en_preparacion','preparacion'=>'en_preparacion','cocinando'=>'en_preparacion',
    'camino'=>'en_camino','delivery'=>'en_camino','reparto'=>'en_camino',
    'entrega'=>'entregado'
  ];
  return $map[$e] ?? $e;
}
function step_from(string $slug): int {
  $order = ['pendiente','aceptado','en_preparacion','en_camino','entregado'];
  $i = array_search($slug, $order, true);
  if ($i === false) return ($slug==='cancelado'?0:0);
  return $i;
}
function label_from(string $slug): string {
  switch ($slug) {
    case 'aceptado': return 'Aceptado';
    case 'en_preparacion': return 'En preparación';
    case 'en_camino': return 'En camino';
    case 'entregado': return 'Entregado';
    case 'cancelado': return 'Cancelado';
    default: return 'Pendiente';
  }
}

$id = (int)($_GET['id'] ?? $_GET['pedido'] ?? $_GET['id_pedido'] ?? 0);
if ($id<=0) { http_response_code(400); echo json_encode(['ok'=>false,'msg'=>'id requerido']); exit; }

$main = tExists($mysqli,'pedidos') ? 'pedidos' : (tExists($mysqli,'pedido') ? 'pedido' : null);
if (!$main) { http_response_code(404); echo json_encode(['ok'=>false,'msg'=>'Sin tabla pedidos']); exit; }
$C = cols($mysqli,$main);
$idCol = pick($C,['id_pedido','id']);
$estCol= pick($C,['estado','status']);
if (!$idCol) { http_response_code(500); echo json_encode(['ok'=>false,'msg'=>'Sin columna id']); exit; }

$estado = null;
if ($estCol) {
  $qr = $mysqli->query("SELECT `$estCol` AS e FROM `$main` WHERE `$idCol`=$id LIMIT 1");
  if ($qr && $qr->num_rows) $estado = $qr->fetch_assoc()['e'];
}
if (!$estado && tExists($mysqli,'pedido_historial')) {
  $HC = cols($mysqli,'pedido_historial');
  $hId = pick($HC,['id_pedido','pedido_id','id_orden','orden_id']);
  $hEst= pick($HC,['estado','status']);
  $hDt = pick($HC,['fecha_hora','fecha','created_at','creado']);
  $hPk = pick($HC,['id_historial','id']);
  if ($hId && $hEst) {
    $order = $hDt ? "`$hDt` DESC" : ($hPk ? "`$hPk` DESC" : "1");
    $qh = $mysqli->query("SELECT `$hEst` AS e FROM `pedido_historial` WHERE `$hId`=$id ORDER BY $order LIMIT 1");
    if ($qh && $qh->num_rows) $estado = $qh->fetch_assoc()['e'];
  }
}
if (!$estado) $estado = 'pendiente';

$slug = norm_estado($estado);
$step = step_from($slug);
echo json_encode(['ok'=>true,'id'=>$id,'estado'=>$slug,'estado_label'=>label_from($slug),'estado_step'=>$step]);