<?php
// admin/backend/reservas/list.php
require_once '../config/conexion.php';
session_start(); // Iniciar sesión sin forzar autenticación aquí

header('Content-Type: application/json; charset=utf-8');
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Pragma: no-cache");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

try {
  $action = $_GET['action'] ?? 'listar';
  
  switch ($action) {
    case 'listar':
      // Obtener filtros
      $fecha_desde = $_GET['fecha_desde'] ?? null;
      $fecha_hasta = $_GET['fecha_hasta'] ?? null;
      $estado = $_GET['estado'] ?? null;
      
      $sql = "SELECT * FROM reservas WHERE 1=1";
      $params = [];
      
      if ($fecha_desde) {
        $sql .= " AND fecha >= ?";
        $params[] = $fecha_desde;
      }
      if ($fecha_hasta) {
        $sql .= " AND fecha <= ?";
        $params[] = $fecha_hasta;
      }
      if ($estado) {
        $sql .= " AND estado = ?";
        $params[] = $estado;
      }
      
      $sql .= " ORDER BY fecha DESC, hora DESC";
      
      $stmt = $pdo->prepare($sql);
      $stmt->execute($params);
      $reservas = $stmt->fetchAll(PDO::FETCH_ASSOC);
      
      echo json_encode([
        'ok' => true,
        'reservas' => $reservas
      ]);
      break;
      
    case 'estadisticas':
      // Obtener estadísticas de reservas
      $sql = "SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
        SUM(CASE WHEN estado = 'confirmada' THEN 1 ELSE 0 END) as confirmadas,
        SUM(CASE WHEN estado = 'cancelada' THEN 1 ELSE 0 END) as canceladas,
        SUM(CASE WHEN estado = 'completada' THEN 1 ELSE 0 END) as completadas,
        SUM(personas) as total_personas,
        AVG(personas) as promedio_personas
      FROM reservas
      WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)";
      
      $stmt = $pdo->query($sql);
      $stats = $stmt->fetch(PDO::FETCH_ASSOC);
      
      echo json_encode([
        'ok' => true,
        'estadisticas' => $stats
      ]);
      break;
      
    default:
      echo json_encode(['ok' => false, 'msg' => 'Acción no válida']);
  }
} catch (Exception $e) {
  echo json_encode([
    'ok' => false,
    'msg' => 'Error: ' . $e->getMessage()
  ]);
}
