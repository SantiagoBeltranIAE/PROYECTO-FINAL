<?php
// admin/backend/calendario/list.php
require_once '../config/conexion.php';
session_start();

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
      // Obtener todos los eventos activos
      $sql = "SELECT * FROM eventos_calendario WHERE activo = 1 ORDER BY fecha_inicio DESC";
      $stmt = $pdo->query($sql);
      $eventos = $stmt->fetchAll(PDO::FETCH_ASSOC);
      
      // Formatear para FullCalendar
      $formatted = array_map(function($e) {
        return [
          'id' => $e['id_evento'],
          'title' => $e['titulo'],
          'description' => $e['descripcion'],
          'start' => $e['fecha_inicio'],
          'end' => $e['fecha_fin'],
          'color' => $e['color'] ?? '#f59e0b',
          'extendedProps' => [
            'activo' => $e['activo'],
            'description' => $e['descripcion']
          ]
        ];
      }, $eventos);
      
      echo json_encode([
        'ok' => true,
        'eventos' => $formatted
      ]);
      break;
      
    case 'publico':
      // Para el calendario público (sin autenticación)
      $sql = "SELECT id_evento, titulo, fecha_inicio, fecha_fin, color 
              FROM eventos_calendario 
              WHERE activo = 1 
              ORDER BY fecha_inicio ASC";
      $stmt = $pdo->query($sql);
      $eventos = $stmt->fetchAll(PDO::FETCH_ASSOC);
      
      $formatted = array_map(function($e) {
        return [
          'title' => $e['titulo'],
          'start' => $e['fecha_inicio'],
          'end' => $e['fecha_fin'],
          'color' => $e['color'] ?? '#f59e0b'
        ];
      }, $eventos);
      
      echo json_encode($formatted);
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
