<?php
// admin/backend/reservas/delete.php
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
  $id_reserva = $_POST['id_reserva'] ?? null;
  
  if (!$id_reserva) {
    echo json_encode(['ok' => false, 'msg' => 'ID de reserva requerido']);
    exit;
  }
  
  $stmt = $pdo->prepare("DELETE FROM reservas WHERE id_reserva = ?");
  $stmt->execute([$id_reserva]);
  
  echo json_encode([
    'ok' => true,
    'msg' => 'Reserva eliminada correctamente'
  ]);
} catch (Exception $e) {
  echo json_encode([
    'ok' => false,
    'msg' => 'Error: ' . $e->getMessage()
  ]);
}
