<?php
// backend/auth/me.php
require_once __DIR__."/../config/session.php";
if (isset($_SESSION["admin_id"])) {
  echo json_encode(["ok" => true, "nombre" => $_SESSION["admin_nombre"]]);
} else {
  http_response_code(401);
  echo json_encode(["error" => "No autenticado"]);
}
