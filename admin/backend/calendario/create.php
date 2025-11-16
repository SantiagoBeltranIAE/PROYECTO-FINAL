<?php
// admin/backend/calendario/create.php
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
  $titulo = $_POST['titulo'] ?? null;
  $descripcion = $_POST['descripcion'] ?? null;
  $fecha_inicio = $_POST['fecha_inicio'] ?? null;
  $fecha_fin = $_POST['fecha_fin'] ?? null;
  $color = $_POST['color'] ?? '#f59e0b';
  
  if (!$titulo || !$fecha_inicio) {
    echo json_encode(['ok' => false, 'msg' => 'Título y fecha de inicio son requeridos']);
    exit;
  }
  
  $sql = "INSERT INTO eventos_calendario (titulo, descripcion, fecha_inicio, fecha_fin, color) 
          VALUES (?, ?, ?, ?, ?)";
  
  $stmt = $pdo->prepare($sql);
  $stmt->execute([$titulo, $descripcion, $fecha_inicio, $fecha_fin, $color]);
  
  echo json_encode([
    'ok' => true,
    'msg' => 'Evento creado correctamente',
    'id_evento' => $pdo->lastInsertId()
  ]);
} catch (Exception $e) {
  echo json_encode([
    'ok' => false,
    'msg' => 'Error: ' . $e->getMessage()
  ]);
}
