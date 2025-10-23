<?php
// php/routes/api.php
require_once __DIR__."/../backend/config/database.php";

// CORS sencillo
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }

$action = $_GET["action"] ?? $_POST["action"] ?? "";

switch ($action) {
  // ... tus otras acciones (productos, etc.)

  case 'crear_pedido':
    require_once __DIR__."/../controllers/pedidos.php";
    crear_pedido($mysqli); // <= pasa el $mysqli de database.php
    break;

  default:
    header("Content-Type: application/json; charset=utf-8");
    http_response_code(404);
    echo json_encode(["ok"=>false,"error"=>"Acción no encontrada"]);
}
