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

// ========== VENTAS TOTALES Y MÉTRICAS PRINCIPALES ==========
$stmt = $mysqli->prepare("SELECT 
    COALESCE(SUM(total),0) AS total_ventas, 
    COUNT(*) AS cant_pedidos,
    COALESCE(AVG(total),0) AS ticket_promedio,
    COALESCE(MAX(total),0) AS ticket_maximo,
    COALESCE(MIN(total),0) AS ticket_minimo
FROM pedidos WHERE fecha_hora BETWEEN ? AND ? AND estado != 'cancelado'");
$stmt->bind_param("ss", $desde, $hasta);
$stmt->execute();
$out["ventas"] = $stmt->get_result()->fetch_assoc();

// ========== TOP PRODUCTOS POR VENTAS ==========
$qTop = "SELECT 
    d.producto_nombre as nombre,
    pr.categoria,
    SUM(d.cantidad) as unidades, 
    SUM(d.cantidad * d.precio_unitario) as ingreso,
    ROUND(AVG(d.precio_unitario), 2) as precio_promedio
FROM pedido_detalle d
JOIN pedidos p ON p.id_pedido = d.id_pedido
LEFT JOIN producto pr ON pr.nombre = d.producto_nombre
WHERE p.fecha_hora BETWEEN ? AND ? AND p.estado != 'cancelado'
GROUP BY d.producto_nombre, pr.categoria
ORDER BY ingreso DESC 
LIMIT 10";
$stmt = $mysqli->prepare($qTop);
$stmt->bind_param("ss", $desde, $hasta);
$stmt->execute();
$res = $stmt->get_result();
$top = [];
while ($r = $res->fetch_assoc()) { 
    $top[] = $r; 
}
$out["top_productos"] = $top;

// ========== VENTAS POR DÍA ==========
$qDia = "SELECT 
    DATE(p.fecha_hora) as dia, 
    COALESCE(SUM(p.total),0) as total,
    COUNT(*) as pedidos,
    COALESCE(AVG(p.total),0) as promedio
FROM pedidos p
WHERE p.fecha_hora BETWEEN ? AND ? AND p.estado != 'cancelado'
GROUP BY DATE(p.fecha_hora) 
ORDER BY dia";
$stmt = $mysqli->prepare($qDia);
$stmt->bind_param("ss", $desde, $hasta);
$stmt->execute();
$res = $stmt->get_result();
$dias = [];
while ($r = $res->fetch_assoc()) { $dias[] = $r; }
$out["ventas_por_dia"] = $dias;

// ========== VENTAS POR CATEGORÍA ==========
$qCat = "SELECT 
    COALESCE(pr.categoria, 'Sin categoría') as categoria,
    COUNT(DISTINCT d.id_pedido) as pedidos,
    SUM(d.cantidad) as unidades,
    SUM(d.cantidad * d.precio_unitario) as ingreso
FROM pedido_detalle d
JOIN pedidos p ON p.id_pedido = d.id_pedido
LEFT JOIN producto pr ON pr.nombre = d.producto_nombre
WHERE p.fecha_hora BETWEEN ? AND ? AND p.estado != 'cancelado'
GROUP BY pr.categoria
ORDER BY ingreso DESC";
$stmt = $mysqli->prepare($qCat);
$stmt->bind_param("ss", $desde, $hasta);
$stmt->execute();
$res = $stmt->get_result();
$cats = [];
while ($r = $res->fetch_assoc()) { $cats[] = $r; }
$out["ventas_por_categoria"] = $cats;

// ========== ESTADOS DE PEDIDOS ==========
$qEstados = "SELECT 
    estado,
    COUNT(*) as cantidad,
    COALESCE(SUM(total),0) as total_valor
FROM pedidos 
WHERE fecha_hora BETWEEN ? AND ?
GROUP BY estado
ORDER BY cantidad DESC";
$stmt = $mysqli->prepare($qEstados);
$stmt->bind_param("ss", $desde, $hasta);
$stmt->execute();
$res = $stmt->get_result();
$estados = [];
while ($r = $res->fetch_assoc()) { $estados[] = $r; }
$out["estados_pedidos"] = $estados;

// ========== VENTAS POR HORA DEL DÍA ==========
$qHoras = "SELECT 
    HOUR(fecha_hora) as hora,
    COUNT(*) as pedidos,
    COALESCE(SUM(total),0) as total
FROM pedidos
WHERE fecha_hora BETWEEN ? AND ? AND estado != 'cancelado'
GROUP BY HOUR(fecha_hora)
ORDER BY hora";
$stmt = $mysqli->prepare($qHoras);
$stmt->bind_param("ss", $desde, $hasta);
$stmt->execute();
$res = $stmt->get_result();
$horas = [];
while ($r = $res->fetch_assoc()) { $horas[] = $r; }
$out["ventas_por_hora"] = $horas;

// ========== MÉTODOS DE PAGO ==========
$qPago = "SELECT 
    CASE 
        WHEN metodo_pago IS NULL OR metodo_pago = '' THEN 'Tarjeta'
        ELSE metodo_pago
    END as metodo_pago,
    COUNT(*) as cantidad,
    COALESCE(SUM(total),0) as total_valor
FROM pedidos
WHERE fecha_hora BETWEEN ? AND ? AND estado != 'cancelado'
GROUP BY CASE 
    WHEN metodo_pago IS NULL OR metodo_pago = '' THEN 'Tarjeta'
    ELSE metodo_pago
END
ORDER BY cantidad DESC";
$stmt = $mysqli->prepare($qPago);
$stmt->bind_param("ss", $desde, $hasta);
$stmt->execute();
$res = $stmt->get_result();
$pagos = [];
while ($r = $res->fetch_assoc()) { $pagos[] = $r; }
$out["metodos_pago"] = $pagos;

// ========== COMPARACIÓN CON PERÍODO ANTERIOR ==========
$diasDif = (strtotime($hasta) - strtotime($desde)) / 86400;
$desdeAnt = date("Y-m-d H:i:s", strtotime($desde) - ($diasDif * 86400));
$hastaAnt = date("Y-m-d H:i:s", strtotime($hasta) - ($diasDif * 86400));

$stmt = $mysqli->prepare("SELECT 
    COALESCE(SUM(total),0) AS total_ventas, 
    COUNT(*) AS cant_pedidos
FROM pedidos WHERE fecha_hora BETWEEN ? AND ? AND estado != 'cancelado'");
$stmt->bind_param("ss", $desdeAnt, $hastaAnt);
$stmt->execute();
$anterior = $stmt->get_result()->fetch_assoc();

$out["periodo_anterior"] = $anterior;
$out["comparacion"] = [
    "ventas_crecimiento" => $anterior["total_ventas"] > 0 
        ? round((($out["ventas"]["total_ventas"] - $anterior["total_ventas"]) / $anterior["total_ventas"]) * 100, 2)
        : 0,
    "pedidos_crecimiento" => $anterior["cant_pedidos"] > 0
        ? round((($out["ventas"]["cant_pedidos"] - $anterior["cant_pedidos"]) / $anterior["cant_pedidos"]) * 100, 2)
        : 0
];

header('Content-Type: application/json; charset=utf-8');
echo json_encode($out, JSON_UNESCAPED_UNICODE);
