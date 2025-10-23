<?php
// backend/productos/update.php
require_once __DIR__."/../config/conexion.php";
require_once __DIR__."/../config/session.php";
exigir_auth();

/* Helpers */
function slug($s) {
  $s = @iconv('UTF-8','ASCII//TRANSLIT', $s);
  $s = preg_replace('~[^a-zA-Z0-9]+~', '-', $s);
  $s = trim($s, '-');
  return strtolower($s ?: 'img');
}
function uploadsDir(): string {
  // __DIR__ = admin/backend/productos -> raíz del proyecto = dirname(__DIR__,3)
  $root = dirname(__DIR__, 3);
  $dir  = $root . DIRECTORY_SEPARATOR . 'imagenes' . DIRECTORY_SEPARATOR . 'uploads';
  if (!is_dir($dir)) @mkdir($dir, 0777, true);
  return $dir;
}
function saveUploadedImage(string $field, string $nameHint=''): array {
  if (empty($_FILES[$field]) || $_FILES[$field]['error'] === UPLOAD_ERR_NO_FILE) {
    return ['ok'=>false, 'msg'=>'sin archivo'];
  }
  $f = $_FILES[$field];
  if ($f['error'] !== UPLOAD_ERR_OK) return ['ok'=>false, 'msg'=>'error '.$f['error']];

  $orig = $f['name'] ?? 'imagen';
  $ext  = strtolower(pathinfo($orig, PATHINFO_EXTENSION));
  $allowed = ['jpg','jpeg','png','webp','gif'];

  if (in_array($ext, ['heic','heif'], true)) {
    if (class_exists('Imagick')) {
      try {
        $im = new Imagick($f['tmp_name']);
        $im->setImageFormat('jpeg');
        $tmp = tempnam(sys_get_temp_dir(), 'heic');
        $im->writeImage($tmp);
        $f['tmp_name'] = $tmp;
        $ext = 'jpg';
      } catch (Throwable $e) {
        return ['ok'=>false, 'msg'=>'HEIC no soportado'];
      }
    } else {
      return ['ok'=>false, 'msg'=>'HEIC no soportado'];
    }
  }
  if (!in_array($ext, $allowed, true)) return ['ok'=>false, 'msg'=>'formato no permitido'];
  if (($f['size'] ?? 0) > 5*1024*1024) return ['ok'=>false, 'msg'=>'>5MB'];

  $dir  = uploadsDir();
  $safe = slug($nameHint ?: pathinfo($orig, PATHINFO_FILENAME));
  $fn   = time().'_'.$safe.'.'.($ext === 'jpeg' ? 'jpg' : $ext);
  $dest = $dir . DIRECTORY_SEPARATOR . $fn;

  if (!@move_uploaded_file($f['tmp_name'], $dest)) {
    return ['ok'=>false, 'msg'=>'no se pudo guardar'];
  }
  // Ruta relativa que usa el front
  return ['ok'=>true, 'path'=>"imagenes/uploads/$fn"];
}

/* Entrada: JSON o multipart */
$ct = $_SERVER['CONTENT_TYPE'] ?? '';
$isMultipart = stripos($ct, 'multipart/form-data') !== false;

if ($isMultipart) {
  $id             = intval($_POST['id_producto'] ?? $_POST['id'] ?? 0);
  $nombre         = trim($_POST['nombre'] ?? '');
  $categoria      = trim($_POST['categoria'] ?? '');
  $precio         = floatval($_POST['precio'] ?? 0);
  $descripcion    = $_POST['descripcion'] ?? null;
  $personalizable = !empty($_POST['personalizable']) ? 1 : 0;

  $tp = $_POST['tamanos_precios'] ?? null;
  if (is_string($tp) && $tp !== '') {
    $decoded = json_decode($tp, true);
    $tamanos_json = $decoded ? json_encode($decoded, JSON_UNESCAPED_UNICODE) : null;
  } else {
    $tamanos_json = null;
  }

  if ($id <= 0) { http_response_code(400); echo json_encode(['ok'=>false,'msg'=>'id inválido']); exit; }

  $img = saveUploadedImage('imagen', $nombre);
  if ($img['ok']) {
    $stmt = $mysqli->prepare("UPDATE producto SET nombre=?, descripcion=?, categoria=?, precio=?, imagen_url=?, personalizable=?, tamanos_precios=? WHERE id_producto=?");
    $stmt->bind_param("sssdsisi", $nombre, $descripcion, $categoria, $precio, $img['path'], $personalizable, $tamanos_json, $id);
  } else {
    $stmt = $mysqli->prepare("UPDATE producto SET nombre=?, descripcion=?, categoria=?, precio=?, personalizable=?, tamanos_precios=? WHERE id_producto=?");
    $stmt->bind_param("sssdisi", $nombre, $descripcion, $categoria, $precio, $personalizable, $tamanos_json, $id);
  }
  $ok = $stmt->execute();
  echo json_encode(['ok'=>$ok, 'imagen_url'=>$img['ok'] ? $img['path'] : null]); exit;
}

/* JSON (texto, sin archivo) */
$body = json_decode(file_get_contents("php://input"), true) ?: [];
$id             = intval($body["id_producto"] ?? $body['id'] ?? 0);
if ($id <= 0) { http_response_code(400); echo json_encode(["ok"=>false,"msg"=>"id inválido"]); exit; }

$nombre         = trim($body["nombre"] ?? "");
$categoria      = trim($body["categoria"] ?? "");
$precio         = floatval($body["precio"] ?? 0);
$descripcion    = $body["descripcion"] ?? null;
$imagen_url     = $body["imagen_url"] ?? null; // opcional
$personalizable = !empty($body["personalizable"]) ? 1 : 0;
$tamanos        = $body["tamanos_precios"] ?? null;
$tamanos_json   = $tamanos ? json_encode($tamanos, JSON_UNESCAPED_UNICODE) : null;

if ($imagen_url !== null && $imagen_url !== '') {
  $stmt = $mysqli->prepare("UPDATE producto SET nombre=?, descripcion=?, categoria=?, precio=?, imagen_url=?, personalizable=?, tamanos_precios=? WHERE id_producto=?");
  $stmt->bind_param("sssdsisi", $nombre, $descripcion, $categoria, $precio, $imagen_url, $personalizable, $tamanos_json, $id);
} else {
  $stmt = $mysqli->prepare("UPDATE producto SET nombre=?, descripcion=?, categoria=?, precio=?, personalizable=?, tamanos_precios=? WHERE id_producto=?");
  $stmt->bind_param("sssdisi", $nombre, $descripcion, $categoria, $precio, $personalizable, $tamanos_json, $id);
}
$ok = $stmt->execute();
echo json_encode(["ok"=>$ok]);
