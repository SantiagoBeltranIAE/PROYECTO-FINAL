<?php
// backend/pedidos/estado_publico.php
require_once __DIR__."/../config/conexion.php";

header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Pragma: no-cache");
header("Access-Control-Allow-Origin: *");

$code = trim($_GET["code"] ?? "");
$id   = intval($_GET["id_pedido"] ?? 0);
if ($code === "" && $id <= 0) {
  http_response_code(400);
  echo json_encode(["error"=>"Falta ?code=TRACK o ?id_pedido=ID"]);
  exit;
}

if ($code !== "") {
  $stmt = $mysqli->prepare("SELECT id_pedido, tracking_code, estado, total, fecha_hora FROM pedido WHERE tracking_code=? LIMIT 1");
  $stmt->bind_param("s", $code);
} else {
  $stmt = $mysqli->prepare("SELECT id_pedido, tracking_code, estado, total, fecha_hora FROM pedido WHERE id_pedido=? LIMIT 1");
  $stmt->bind_param("i", $id);
}
$stmt->execute();
$pedido = $stmt->get_result()->fetch_assoc();

if (!$pedido) {
  http_response_code(404);
  echo json_encode(["error"=>"Pedido no encontrado"]);
  exit;
}

$hist = [];
$res = $mysqli->query("SELECT estado, fecha_hora FROM pedido_historial WHERE id_pedido=".(int)$pedido["id_pedido"]." ORDER BY fecha_hora ASC, id ASC");
while ($r = $res->fetch_assoc()) { $hist[] = $r; }

$orden_estados = [
  "nuevo" => 1,
  "confirmado" => 2,
  "aceptado" => 2,
  "en_preparacion" => 3,
  "en_camino" => 4,
  "entregado" => 5,
  "cancelado" => 99
];

$estado_actual = $pedido["estado"] ?? "nuevo";
$paso = $orden_estados[$estado_actual] ?? 1;

echo json_encode([
  "ok" => true,
  "pedido" => [
    "id_pedido"    => (int)$pedido["id_pedido"],
    "tracking_code"=> $pedido["tracking_code"],
    "estado"       => $estado_actual,
    "paso"         => $paso,
    "total"        => (float)$pedido["total"],
    "fecha"        => $pedido["fecha_hora"],
  ],
  "historial" => $hist
]);
