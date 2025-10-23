<?php
<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../db.php';

$data = json_decode(file_get_contents('php://input'), true) ?: $_POST;
$name = trim($data['name'] ?? '');
$description = $data['description'] ?? '';
$price = $data['price'] ?? null;

if ($name === '' || $price === null) {
  echo json_encode(['ok'=>false,'msg'=>'Campos incompletos']);
  exit;
}

try {
  $stmt = $db->prepare("INSERT INTO productos (name, description, price) VALUES (?, ?, ?)");
  $stmt->execute([$name, $description, $price]);
  $id = $db->lastInsertId();

  // actualizar versión
  $db->prepare("INSERT INTO meta (name,value) VALUES ('productos_version', NOW()) ON DUPLICATE KEY UPDATE value = NOW()")->execute();

  echo json_encode(['ok'=>true,'id'=>$id]);
} catch (Exception $e) {
  echo json_encode(['ok'=>false,'msg'=>$e->getMessage()]);
}