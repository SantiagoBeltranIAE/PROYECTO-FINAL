<?php
<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../db.php';

$data = json_decode(file_get_contents('php://input'), true) ?: $_POST;
$id = (int)($data['id'] ?? 0);
$name = trim($data['name'] ?? '');
$description = $data['description'] ?? '';
$price = $data['price'] ?? null;

if (!$id || $name === '' || $price === null) {
  echo json_encode(['ok'=>false,'msg'=>'Campos inválidos']);
  exit;
}

try {
  $stmt = $db->prepare("UPDATE productos SET name = ?, description = ?, price = ? WHERE id = ? LIMIT 1");
  $stmt->execute([$name, $description, $price, $id]);

  $db->prepare("INSERT INTO meta (name,value) VALUES ('productos_version', NOW()) ON DUPLICATE KEY UPDATE value = NOW()")->execute();

  echo json_encode(['ok'=>true]);
} catch (Exception $e) {
  echo json_encode(['ok'=>false,'msg'=>$e->getMessage()]);
}