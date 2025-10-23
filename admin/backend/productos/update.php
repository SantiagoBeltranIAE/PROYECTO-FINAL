<?php
// backend/productos/update.php
require_once __DIR__."/../config/conexion.php";
require_once __DIR__."/../config/session.php";
exigir_auth();

$body = json_decode(file_get_contents("php://input"), true);
$id = intval($body["id_producto"] ?? 0);
if ($id <= 0) { http_response_code(400); echo json_encode(["error"=>"id inválido"]); exit; }

$nombre = trim($body["nombre"] ?? "");
$categoria = trim($body["categoria"] ?? "");
$precio = floatval($body["precio"] ?? 0);
$descripcion = $body["descripcion"] ?? null;
$imagen_url = $body["imagen_url"] ?? null;
$personalizable = !empty($body["personalizable"]) ? 1 : 0;
$tamanos = $body["tamanos_precios"] ?? null;
$tamanos_json = $tamanos ? json_encode($tamanos, JSON_UNESCAPED_UNICODE) : null;

$stmt = $mysqli->prepare("UPDATE producto SET nombre=?, descripcion=?, categoria=?, precio=?, imagen_url=?, personalizable=?, tamanos_precios=? WHERE id_producto=?");
$stmt->bind_param("sssdsisi", $nombre, $descripcion, $categoria, $precio, $imagen_url, $personalizable, $tamanos_json, $id);
$stmt->execute();

echo json_encode(["ok" => true]);
