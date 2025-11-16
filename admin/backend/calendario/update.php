<?php
// admin/backend/calendario/update.php
require_once '../config/conexion.php';
session_start();

header('Content-Type: application/json; charset=utf-8');
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Pragma: no-cache");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  echo json_encode(['ok' => false, 'msg' => 'Método no permitido']);
  exit;
}

try {
  $id_evento = $_POST['id_evento'] ?? null;
  
  if (!$id_evento) {
    echo json_encode(['ok' => false, 'msg' => 'ID de evento requerido']);
    exit;
  }
  
  $updates = [];
  $params = [];
  
  if (isset($_POST['titulo'])) {
    $updates[] = "titulo = ?";
    $params[] = $_POST['titulo'];
  }
  
  if (isset($_POST['descripcion'])) {
    $updates[] = "descripcion = ?";
    $params[] = $_POST['descripcion'];
  }
  
  if (isset($_POST['fecha_inicio'])) {
    $updates[] = "fecha_inicio = ?";
    $params[] = $_POST['fecha_inicio'];
  }
  
  if (isset($_POST['fecha_fin'])) {
    $updates[] = "fecha_fin = ?";
    $params[] = $_POST['fecha_fin'];
  }
  
  if (isset($_POST['color'])) {
    $updates[] = "color = ?";
    $params[] = $_POST['color'];
  }
  
  if (isset($_POST['activo'])) {
    $updates[] = "activo = ?";
    $params[] = $_POST['activo'];
  }
  
  if (empty($updates)) {
    echo json_encode(['ok' => false, 'msg' => 'No hay datos para actualizar']);
    exit;
  }
  
  $params[] = $id_evento;
  $sql = "UPDATE eventos_calendario SET " . implode(', ', $updates) . " WHERE id_evento = ?";
  
  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);
  
  echo json_encode([
    'ok' => true,
    'msg' => 'Evento actualizado correctamente'
  ]);
} catch (Exception $e) {
  echo json_encode([
    'ok' => false,
    'msg' => 'Error: ' . $e->getMessage()
  ]);
}
