<?php
// fronted-mejor/php/backend/controllers/reservas.php
require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json; charset=utf-8');

// Permitir CORS si es necesario
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  exit;
}

try {
  $action = $_GET['action'] ?? $_POST['action'] ?? 'crear';
  
  if ($action === 'crear' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    // Recibir datos de la reserva
    $nombre = trim($_POST['nombre'] ?? '');
    $telefono = trim($_POST['telefono'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $fecha = trim($_POST['fecha'] ?? '');
    $hora = trim($_POST['hora'] ?? '');
    $personas = (int)($_POST['personas'] ?? 0);
    $comentarios = trim($_POST['comentarios'] ?? '');
    
    // Validaciones
    if (empty($nombre) || empty($telefono) || empty($email) || empty($fecha) || empty($hora) || $personas < 1) {
      echo json_encode([
        'ok' => false,
        'msg' => 'Todos los campos son requeridos'
      ]);
      exit;
    }
    
    // Validar email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
      echo json_encode([
        'ok' => false,
        'msg' => 'Email no válido'
      ]);
      exit;
    }
    
    // Insertar en la base de datos
    $sql = "INSERT INTO reservas (nombre, telefono, email, fecha, hora, personas, comentarios, estado) 
            VALUES (?, ?, ?, ?, ?, ?, ?, 'pendiente')";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$nombre, $telefono, $email, $fecha, $hora, $personas, $comentarios]);
    
    echo json_encode([
      'ok' => true,
      'msg' => '¡Reserva creada exitosamente! Te contactaremos pronto para confirmar.',
      'id_reserva' => $pdo->lastInsertId()
    ]);
  } else {
    echo json_encode([
      'ok' => false,
      'msg' => 'Acción no válida'
    ]);
  }
} catch (Exception $e) {
  echo json_encode([
    'ok' => false,
    'msg' => 'Error al procesar la reserva: ' . $e->getMessage()
  ]);
}
