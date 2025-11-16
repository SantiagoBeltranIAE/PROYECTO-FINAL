<?php
// admin/backend/calendario/delete.php
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
  
  // En lugar de eliminar, desactivar
  $stmt = $pdo->prepare("UPDATE eventos_calendario SET activo = 0 WHERE id_evento = ?");
  $stmt->execute([$id_evento]);
  
  echo json_encode([
    'ok' => true,
    'msg' => 'Evento eliminado correctamente'
  ]);
} catch (Exception $e) {
  echo json_encode([
    'ok' => false,
    'msg' => 'Error: ' . $e->getMessage()
  ]);
}
