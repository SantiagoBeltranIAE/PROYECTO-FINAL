<?php
// backend/auth/login.php
require_once __DIR__."/../config/conexion.php";
require_once __DIR__."/../config/session.php";

$body = json_decode(file_get_contents("php://input"), true);
$email = trim($body["email"] ?? "");
$pass  = $body["pass"] ?? "";

$stmt = $mysqli->prepare("SELECT id, nombre, email, pass_hash FROM usuario_admin WHERE email=? LIMIT 1");
$stmt->bind_param("s", $email);
$stmt->execute();
$res = $stmt->get_result();
$user = $res->fetch_assoc();

if (!$user || !password_verify($pass, $user["pass_hash"])) {
  http_response_code(401);
  echo json_encode(["error" => "Credenciales inválidas"]);
  exit;
}

$_SESSION["admin_id"] = $user["id"];
$_SESSION["admin_nombre"] = $user["nombre"];
echo json_encode(["ok" => true, "nombre" => $user["nombre"]]);
