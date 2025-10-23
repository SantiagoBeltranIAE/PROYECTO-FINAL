<?php
// backend/productos/delete.php
require_once __DIR__."/../config/conexion.php";
require_once __DIR__."/../config/session.php";
exigir_auth();

$body = json_decode(file_get_contents("php://input"), true);
$id = intval($body["id_producto"] ?? 0);
if ($id <= 0) { http_response_code(400); echo json_encode(["error"=>"id inválido"]); exit; }

$stmt = $mysqli->prepare("DELETE FROM producto WHERE id_producto=?");
$stmt->bind_param("i", $id);
$stmt->execute();

echo json_encode(["ok" => true]);
