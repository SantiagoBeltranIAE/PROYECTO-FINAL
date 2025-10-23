<?php
// backend/auth/seed_admin.php
require_once __DIR__."/../config/conexion.php";

$email = "admin@local";
$nombre = "Admin";
$pass = "admin123"; // luego cambiala desde el panel

$hash = password_hash($pass, PASSWORD_DEFAULT);

$stmt = $mysqli->prepare("INSERT IGNORE INTO usuario_admin (nombre, email, pass_hash) VALUES (?, ?, ?)");
$stmt->bind_param("sss", $nombre, $email, $hash);
$stmt->execute();

header("Content-Type: application/json; charset=utf-8");
echo json_encode(["ok" => true, "email" => $email, "pass" => $pass]);
