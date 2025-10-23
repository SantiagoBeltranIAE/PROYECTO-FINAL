<?php
// backend/config/session.php
session_start();

function exigir_auth() {
  if (!isset($_SESSION["admin_id"])) {
    http_response_code(401);
    header("Content-Type: application/json; charset=utf-8");
    echo json_encode(["error" => "No autenticado"]);
    exit;
  }
}

header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Pragma: no-cache");

// CORS simple para desarrollo local
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }
