<?php
// backend/estadisticas/resumen.php
require_once __DIR__."/../config/conexion.php";
require_once __DIR__."/../config/session.php";
exigir_auth();

$desde = $_GET["desde"] ?? date("Y-m-01");
$hasta = $_GET["hasta"] ?? date("Y-m-d");

$desde .= " 00:00:00";
$hasta .= " 23:59:59";

$out = [];

$stmt = $mysqli->prepare("SELECT COALESCE(SUM(total),0) AS total_ventas, COUNT(*) AS cant_pedidos
                          FROM pedido WHERE fecha_hora BETWEEN ? AND ?");
$stmt->bind_param("ss", $desde, $hasta);
$stmt->execute();
$out["ventas"] = $stmt->get_result()->fetch_assoc();

$qTop = "SELECT pr.nombre, SUM(d.cantidad) as unidades, SUM(d.subtotal) as ingreso
         FROM detalle_pedido d
         JOIN producto pr ON pr.id_producto = d.id_producto
         JOIN pedido p ON p.id_pedido = d.id_pedido
         WHERE p.fecha_hora BETWEEN '".$mysqli->real_escape_string($desde)."' AND '".$mysqli->real_escape_string($hasta)."'
         GROUP BY pr.id_producto ORDER BY unidades DESC LIMIT 10";
$res = $mysqli->query($qTop);
$top = [];
while ($r = $res->fetch_assoc()) { $top[] = $r; }
$out["top_productos"] = $top;

$qDia = "SELECT DATE(p.fecha_hora) as dia, COALESCE(SUM(p.total),0) as total
         FROM pedido p
         WHERE p.fecha_hora BETWEEN '".$mysqli->real_escape_string($desde)."' AND '".$mysqli->real_escape_string($hasta)."'
         GROUP BY DATE(p.fecha_hora) ORDER BY dia";
$res = $mysqli->query($qDia);
$dias = [];
while ($r = $res->fetch_assoc()) { $dias[] = $r; }
$out["ventas_por_dia"] = $dias;

echo json_encode($out);
