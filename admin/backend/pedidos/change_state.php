<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../config/conexion.php'; // $mysqli

if (!isset($mysqli) || !($mysqli instanceof mysqli)) { http_response_code(500); echo json_encode(['ok'=>false,'msg'=>'Sin conexión']); exit; }

function tExists(mysqli $db, string $t){ $r=$db->query("SHOW TABLES LIKE '".$db->real_escape_string($t)."'"); return $r && $r->num_rows>0; }
function tblType(mysqli $db, string $t){ $r=$db->query("SHOW FULL TABLES LIKE '".$db->real_escape_string($t)."'"); if($r && ($row=$r->fetch_row())) return strtoupper($row[1]); return null; }
function cols(mysqli $db, string $t){ $r=$db->query("SHOW COLUMNS FROM `$t`"); $o=[]; if($r) while($x=$r->fetch_assoc()) $o[$x['Field']]=true; return $o; }
function pick($C,$a){ foreach($a as $x) if(isset($C[$x])) return $x; return null; }

$in = json_decode(file_get_contents('php://input'), true) ?: $_POST;
$id     = (int)($in['id'] ?? $in['id_pedido'] ?? 0);
$estado = trim((string)($in['estado'] ?? ''));
if ($id<=0 || $estado==='') { http_response_code(400); echo json_encode(['ok'=>false,'msg'=>'Parámetros inválidos']); exit; }

// Intentar UPDATE en tabla base
$target=null; $idCol=null; $estCol=null;
foreach (['pedidos','pedido'] as $t) {
  if (!tExists($mysqli,$t)) continue;
  if (tblType($mysqli,$t)==='VIEW') continue;
  $C = cols($mysqli,$t);
  $idCol  = pick($C,['id_pedido','id']);
  $estCol = pick($C,['estado','status']);
  if ($idCol && $estCol) { $target=$t; break; }
}

if ($target) {
  $st = $mysqli->prepare("UPDATE `$target` SET `$estCol`=? WHERE `$idCol`=?");
  if (!$st) { http_response_code(500); echo json_encode(['ok'=>false,'msg'=>$mysqli->error]); exit; }
  $st->bind_param('si',$estado,$id);
  if (!$st->execute()) { http_response_code(500); echo json_encode(['ok'=>false,'msg'=>$st->error]); exit; }
  echo json_encode(['ok'=>true,'via'=>'tabla','id'=>$id,'estado'=>$estado]); exit;
}

// Fallback: historial
if (!tExists($mysqli,'pedido_historial')) { http_response_code(500); echo json_encode(['ok'=>false,'msg'=>'No existe pedido_historial']); exit; }
$HC = cols($mysqli,'pedido_historial');
$hId   = pick($HC,['id_pedido','pedido_id','id_orden','orden_id']);
$hEst  = pick($HC,['estado','status']);
$hDate = pick($HC,['fecha_hora','fecha','created_at','creado']);
if (!$hId || !$hEst) { http_response_code(500); echo json_encode(['ok'=>false,'msg'=>'Historial no compatible']); exit; }

if ($hDate) { $st=$mysqli->prepare("INSERT INTO `pedido_historial` (`$hId`,`$hEst`,`$hDate`) VALUES (?,?,NOW())"); $st->bind_param('is',$id,$estado); }
else        { $st=$mysqli->prepare("INSERT INTO `pedido_historial` (`$hId`,`$hEst`) VALUES (?,?)");              $st->bind_param('is',$id,$estado); }
if (!$st->execute()) { http_response_code(500); echo json_encode(['ok'=>false,'msg'=>$st->error]); exit; }
echo json_encode(['ok'=>true,'via'=>'historial','id'=>$id,'estado'=>$estado]);