<?php
// backend/config/conexion.php
// Ajusta credenciales a tu entorno
$DB_HOST = "127.0.0.1";
$DB_NAME = "vanella_delivery";
$DB_USER = "root";
$DB_PASS = ""; // tu contraseña

$mysqli = new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME);
if ($mysqli->connect_errno) {
  http_response_code(500);
  header("Content-Type: application/json; charset=utf-8");
  echo json_encode(["error" => "Error de conexión: ".$mysqli->connect_error]);
  exit;
}
$mysqli->set_charset("utf8mb4");

// También crear conexión PDO para nuevos módulos
try {
  $pdo = new PDO("mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4", $DB_USER, $DB_PASS);
  $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
  http_response_code(500);
  header("Content-Type: application/json; charset=utf-8");
  echo json_encode(["error" => "Error de conexión PDO: ".$e->getMessage()]);
  exit;
}
