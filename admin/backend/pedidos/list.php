<?php
// backend/pedidos/list.php
require_once __DIR__."/../config/conexion.php";
require_once __DIR__."/../config/session.php";
exigir_auth();

$estado = $_GET["estado"] ?? null;
$desde  = $_GET["desde"]  ?? null; // yyyy-mm-dd
$hasta  = $_GET["hasta"]  ?? null;

$where = [];
if ($estado) { $where[] = "p.estado = '". $mysqli->real_escape_string($estado) ."'"; }
if ($desde)  { $where[] = "DATE(p.fecha_hora) >= '". $mysqli->real_escape_string($desde) ."'"; }
if ($hasta)  { $where[] = "DATE(p.fecha_hora) <= '". $mysqli->real_escape_string($hasta) ."'"; }

$sql = "SELECT * FROM vista_pedidos p";
if ($where) { $sql .= " WHERE ".implode(" AND ", $where); }
$sql .= " ORDER BY p.fecha_hora DESC LIMIT 200";

$pedidos = [];
$res = $mysqli->query($sql);
while ($p = $res->fetch_assoc()) {
  $det = [];
  $rsd = $mysqli->query("SELECT * FROM vista_detalle_pedido WHERE id_pedido=".(int)$p["id_pedido"]);
  while ($d = $rsd->fetch_assoc()) { $det[] = $d; }
  $p["detalle"] = $det;
  $pedidos[] = $p;
}
echo json_encode($pedidos);
