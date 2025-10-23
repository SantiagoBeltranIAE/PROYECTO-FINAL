<?php
require_once __DIR__."/../config/conexion.php";

// === Configurá lo que quieras como admin por defecto ===
$email = "admin@local";
$nombre = "Admin";
$nueva_pass = "admin123"; // cambiála después

$hash = password_hash($nueva_pass, PASSWORD_DEFAULT);

// upsert: si existe, actualiza pass; si no, lo crea
$sql = "INSERT INTO usuario_admin (nombre, email, pass_hash)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), pass_hash=VALUES(pass_hash)";
$stmt = $mysqli->prepare($sql);
$stmt->bind_param("sss", $nombre, $email, $hash);
$ok = $stmt->execute();

header("Content-Type: application/json; charset=utf-8");
echo json_encode(["ok"=>$ok, "email"=>$email, "pass"=>$nueva_pass, "error"=>$ok?null:$stmt->error]);
