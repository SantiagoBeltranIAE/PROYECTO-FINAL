<?php
// admin/backend/reservas/update.php
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
  $estado = $_POST['estado'] ?? null;
  $comentarios = $_POST['comentarios'] ?? null;
  
  if (!$id_reserva) {
    echo json_encode(['ok' => false, 'msg' => 'ID de reserva requerido']);
    exit;
  }
  
  $updates = [];
  $params = [];
  
  if ($estado !== null) {
    $updates[] = "estado = ?";
    $params[] = $estado;
  }
  
  if ($comentarios !== null) {
    $updates[] = "comentarios = ?";
    $params[] = $comentarios;
  }
  
  if (empty($updates)) {
    echo json_encode(['ok' => false, 'msg' => 'No hay datos para actualizar']);
    exit;
  }
  
  $params[] = $id_reserva;
  $sql = "UPDATE reservas SET " . implode(', ', $updates) . " WHERE id_reserva = ?";
  
  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);
  
  echo json_encode([
    'ok' => true,
    'msg' => 'Reserva actualizada correctamente'
  ]);
} catch (Exception $e) {
  echo json_encode([
    'ok' => false,
    'msg' => 'Error: ' . $e->getMessage()
  ]);
}
