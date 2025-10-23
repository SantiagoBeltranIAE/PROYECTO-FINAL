<?php
<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../db.php';

$input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
$id = isset($input['id']) ? (int)$input['id'] : 0;
if (!$id) { echo json_encode(['ok'=>false,'msg'=>'id missing']); exit; }

try {
  $db->beginTransaction();
  $stmt = $db->prepare("DELETE FROM productos WHERE id = ? LIMIT 1");
  $stmt->execute([$id]);

  $db->prepare("INSERT INTO meta (name,value) VALUES ('productos_version', NOW()) ON DUPLICATE KEY UPDATE value = NOW()")->execute();

  $db->commit();

  $v = $db->query("SELECT value FROM meta WHERE name='productos_version'")->fetchColumn();
  echo json_encode(['ok'=>true,'version'=>$v]);
} catch (Exception $e) {
  $db->rollBack();
  echo json_encode(['ok'=>false,'msg'=>$e->getMessage()]);
}