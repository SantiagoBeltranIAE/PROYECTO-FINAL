<?php
// backend/productos/create.php
require_once __DIR__."/../config/conexion.php";
require_once __DIR__."/../config/session.php";
exigir_auth();

$body = json_decode(file_get_contents("php://input"), true);
$nombre = trim($body["nombre"] ?? "");
$categoria = trim($body["categoria"] ?? "");
$precio = floatval($body["precio"] ?? 0);
$descripcion = $body["descripcion"] ?? null;
$imagen_url = $body["imagen_url"] ?? null;
$personalizable = !empty($body["personalizable"]) ? 1 : 0;
$tamanos = $body["tamanos_precios"] ?? null;
$tamanos_json = $tamanos ? json_encode($tamanos, JSON_UNESCAPED_UNICODE) : null;

$stmt = $mysqli->prepare("INSERT INTO producto (nombre, descripcion, categoria, precio, imagen_url, personalizable, tamanos_precios)
VALUES (?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("sssdsis", $nombre, $descripcion, $categoria, $precio, $imagen_url, $personalizable, $tamanos_json);
$stmt->execute();

echo json_encode(["ok" => true, "id_producto" => $stmt->insert_id]);
