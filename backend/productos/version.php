<?php
<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../db.php';
$v = $db->query("SELECT value FROM meta WHERE name='productos_version'")->fetchColumn();
echo json_encode(['version' => $v]);