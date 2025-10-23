<?php
// backend/pedidos/list.php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../config/conexion.php';

if (!isset($mysqli) || !($mysqli instanceof mysqli)) { echo json_encode([]); exit; }

function tExists(mysqli $db, string $t){ $r=$db->query("SHOW TABLES LIKE '".$db->real_escape_string($t)."'"); return $r && $r->num_rows>0; }
function cols(mysqli $db, string $t){ $r=$db->query("SHOW COLUMNS FROM `$t`"); $o=[]; if($r) while($x=$r->fetch_assoc()) $o[$x['Field']]=true; return $o; }
function pick($C,$a){ foreach($a as $x) if(isset($C[$x])) return $x; return null; }

// tabla principal
$main = tExists($mysqli,'pedidos') ? 'pedidos' : (tExists($mysqli,'pedido') ? 'pedido' : null);
if (!$main) { echo json_encode([]); exit; }
$C = cols($mysqli,$main);

$idCol    = pick($C,['id_pedido','id']);
$fechaCol = pick($C,['fecha_hora','fecha','created_at']);
$cliCol   = pick($C,['cliente_nombre','cliente','nombre_cliente','nombre']);
$telCol   = pick($C,['telefono','tel','celular','phone']);
$dirCol   = pick($C,['direccion','direccion_envio','domicilio']);
$refCol   = pick($C,['referencia','nota','notas','comentario','observacion','observaciones']);
$totCol   = pick($C,['total','monto_total','total_pedido','importe_total']);
$estCol   = pick($C,['estado','status']);

// estado desde historial si no hay columna
$joinEstado='';
if (!$estCol && tExists($mysqli,'pedido_historial')) {
  $HC = cols($mysqli,'pedido_historial');
  $hId=pick($HC,['id_pedido','pedido_id']);
  $hEst=pick($HC,['estado','status']);
  $hDt=pick($HC,['fecha_hora','fecha','created_at']);
  $hPk=pick($HC,['id_historial','id']);
  if ($hId && $hEst) {
    $ord = $hDt ? "`$hDt`" : "`$hPk`";
    $joinEstado = "LEFT JOIN (
      SELECT h1.`$hId` pid, h1.`$hEst` estado
      FROM `pedido_historial` h1
      JOIN (SELECT `$hId` pid, MAX($ord) mx FROM `pedido_historial` GROUP BY `$hId`) x
        ON x.pid=h1.`$hId` AND $ord=x.mx
    ) hs ON hs.pid=`$main`.`$idCol`";
  }
}

// pedidos
$sql = "SELECT ".
  "`$main`.`$idCol` AS id_pedido,".
  ($fechaCol ? "`$main`.`$fechaCol` AS fecha_hora" : "NULL AS fecha_hora").",".
  ($cliCol ? "`$main`.`$cliCol` AS cliente_nombre" : "'' AS cliente_nombre").",".
  ($telCol ? "`$main`.`$telCol` AS telefono" : "'' AS telefono").",".
  ($dirCol ? "`$main`.`$dirCol` AS direccion" : "'' AS direccion").",".
  ($refCol ? "`$main`.`$refCol` AS referencia" : "'' AS referencia").",".
  ($totCol ? "`$main`.`$totCol` AS total" : "0 AS total").",".
  ($estCol ? "`$main`.`$estCol`" : ($joinEstado ? "COALESCE(hs.estado,'pendiente')" : "'pendiente'"))." AS estado
  FROM `$main` $joinEstado
  ORDER BY `$main`.`$idCol` DESC";
$r = $mysqli->query($sql);
$rows = $r ? $r->fetch_all(MYSQLI_ASSOC) : [];
if (!$rows) { echo json_encode([]); exit; }

// map
$byId = [];
foreach ($rows as &$p) { $p['detalle']=[]; $p['producto']=[]; $p['producto_text']=''; $byId[(int)$p['id_pedido']] =& $p; }
unset($p);
$ids = implode(',', array_map('intval', array_column($rows,'id_pedido')));
if ($ids === '') { echo json_encode($rows); exit; }

// 1) pedido_detalle
if (tExists($mysqli,'pedido_detalle')) {
  $DC = cols($mysqli,'pedido_detalle');
  $dPid  = pick($DC,['id_pedido']);
  $dCant = pick($DC,['cantidad']);
  $dPrec = pick($DC,['precio_unitario']);
  $dNom  = pick($DC,['producto_nombre','nombre_producto','producto','nombre']);
  if ($dPid && $dCant) {
    $q = "SELECT `$dPid` pid, ".($dNom?"`$dNom`":"NULL")." nom, `$dCant` cant, ".($dPrec?"`$dPrec`":"NULL")." precio
          FROM `pedido_detalle` WHERE `$dPid` IN ($ids)";
    if ($qr = $mysqli->query($q)) {
      while ($d = $qr->fetch_assoc()) {
        $pid = (int)$d['pid']; if(!isset($byId[$pid])) continue;
        $name = trim((string)$d['nom']) ?: 'Producto';
        $byId[$pid]['detalle'][] = [
          'producto_nombre' => $name,
          'cantidad'        => (int)$d['cant'],
          'precio_unitario' => is_null($d['precio']) ? null : (float)$d['precio']
        ];
      }
    }
  }
}

// 2) faltantes: detalle_pedido + producto
$faltantes = array_map('intval',
  array_keys(array_filter($byId, fn($p)=>empty($p['detalle'])))
);
if ($faltantes && tExists($mysqli,'detalle_pedido') && tExists($mysqli,'producto')) {
  $ids2 = implode(',', $faltantes);
  $DC = cols($mysqli,'detalle_pedido');
  $dpPid = pick($DC,['id_pedido']);
  $dpProd= pick($DC,['id_producto']);
  $dpCant= pick($DC,['cantidad']);
  $dpSub = pick($DC,['subtotal']);
  $dpMod = pick($DC,['modificaciones']);
  $PC = cols($mysqli,'producto');
  $pId = pick($PC,['id_producto','id']);
  $pName = pick($PC,['nombre']);
  $pPrec = pick($PC,['precio']);

  if ($dpPid && $dpProd && $dpCant && $pId && $pName) {
    $precio = $dpSub
      ? "CASE WHEN d.`$dpSub` IS NOT NULL AND d.`$dpCant`>0 THEN d.`$dpSub`/d.`$dpCant` ".($pPrec?"ELSE p.`$pPrec`":'')." END"
      : ($pPrec ? "p.`$pPrec`" : "NULL");
    $nombre = $dpMod
      ? "TRIM(CONCAT(p.`$pName`, CASE WHEN d.`$dpMod` IS NOT NULL AND d.`$dpMod`<>'' THEN CONCAT(' (', d.`$dpMod`, ')') ELSE '' END))"
      : "p.`$pName`";

    $q2 = "SELECT d.`$dpPid` pid, $nombre nom, d.`$dpCant` cant, $precio precio
           FROM `detalle_pedido` d
           LEFT JOIN `producto` p ON p.`$pId` = d.`$dpProd`
           WHERE d.`$dpPid` IN ($ids2)";
    if ($qr2 = $mysqli->query($q2)) {
      while ($d = $qr2->fetch_assoc()) {
        $pid = (int)$d['pid']; if(!isset($byId[$pid])) continue;
        $name = trim((string)$d['nom']) ?: 'Producto';
        $byId[$pid]['detalle'][] = [
          'producto_nombre' => $name,
          'cantidad'        => (int)$d['cant'],
          'precio_unitario' => is_null($d['precio']) ? null : (float)$d['precio']
        ];
      }
    }
  }
}

// 3) derivar campo “producto”
foreach ($byId as &$p) {
  if (!empty($p['detalle'])) {
    $p['producto'] = array_map(fn($d)=>$d['cantidad'].'x '.$d['producto_nombre'], $p['detalle']);
    $p['producto_text'] = implode("\n", $p['producto']);
  }
}
unset($p);

echo json_encode(array_values($rows));
