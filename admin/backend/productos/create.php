<?php
// backend/productos/create.php
require_once __DIR__."/../config/conexion.php";
require_once __DIR__."/../config/session.php";
exigir_auth();

function slug($s) {
  $s = iconv('UTF-8','ASCII//TRANSLIT', $s);
  $s = preg_replace('~[^a-zA-Z0-9]+~', '-', $s);
  $s = trim($s, '-');
  return strtolower($s ?: 'img');
}

function ensureUploadsDir(): string {
  $root = dirname(__DIR__, 2); // admin/
  $dir  = $root . '/imagenes/uploads';
  if (!is_dir($dir)) @mkdir($dir, 0777, true);
  return $dir;
}

function saveUploadedImage(string $field, string $baseNameHint=''): array {
  if (empty($_FILES[$field]) || $_FILES[$field]['error'] === UPLOAD_ERR_NO_FILE) {
    return ['ok'=>false, 'msg'=>'sin archivo']; // opcional
  }
  $f = $_FILES[$field];
  if ($f['error'] !== UPLOAD_ERR_OK) {
    return ['ok'=>false, 'msg'=>'error de upload (' . $f['error'] . ')'];
  }

  $orig = $f['name'] ?? 'imagen';
  $ext  = strtolower(pathinfo($orig, PATHINFO_EXTENSION));
  $allowed = ['jpg','jpeg','png','webp','gif'];

  // Intento de conversión HEIC -> JPG si hay Imagick
  if (in_array($ext, ['heic','heif'])) {
    if (class_exists('Imagick')) {
      try {
        $img = new Imagick($f['tmp_name']);
        $img->setImageFormat('jpeg');
        $ext = 'jpg';
        $tmp2 = tempnam(sys_get_temp_dir(), 'upx');
        $img->writeImage($tmp2);
        $f['tmp_name'] = $tmp2;
      } catch (Throwable $e) {
        return ['ok'=>false, 'msg'=>'Formato HEIC no soportado en este servidor'];
      }
    } else {
      return ['ok'=>false, 'msg'=>'Formato HEIC no soportado'];
    }
  }

  if (!in_array($ext, $allowed, true)) {
    return ['ok'=>false, 'msg'=>'Formato no permitido'];
  }

  // Tamaño (5MB)
  if (($f['size'] ?? 0) > 5 * 1024 * 1024) {
    return ['ok'=>false, 'msg'=>'Archivo muy grande (>5MB)'];
  }

  $dir = ensureUploadsDir();
  $safe = slug($baseNameHint ?: pathinfo($orig, PATHINFO_FILENAME));
  $name = time() . '_' . $safe . '.' . ($ext === 'jpeg' ? 'jpg' : $ext);
  $dest = $dir . '/' . $name;

  if (!@move_uploaded_file($f['tmp_name'], $dest)) {
    return ['ok'=>false, 'msg'=>'No se pudo guardar el archivo'];
  }

  // Ruta relativa para guardar en DB (coincide con cómo resolvés las imágenes en el front)
  $relative = 'imagenes/uploads/' . $name;
  return ['ok'=>true, 'path'=>$relative];
}

$body = json_decode(file_get_contents("php://input"), true);
$nombre = trim($body["nombre"] ?? "");
$descripcion = trim($body["descripcion"] ?? "");
$precio = floatval($body["precio"] ?? 0);
$categoria = trim($body["categoria"] ?? "");

$imgRes = saveUploadedImage('imagen', $nombre);
$imagenPath = $imgRes['ok'] ? $imgRes['path'] : null;

// Inserta producto (ajusta el nombre de columnas según tu tabla)
$stmt = $mysqli->prepare("INSERT INTO producto (nombre, descripcion, precio, categoria, imagen) VALUES (?,?,?,?,?)");
$stmt->bind_param('ssdss', $nombre, $descripcion, $precio, $categoria, $imagenPath);
if (!$stmt->execute()) {
  http_response_code(500);
  echo json_encode(['ok'=>false, 'msg'=>$stmt->error], JSON_UNESCAPED_UNICODE); exit;
}
echo json_encode(['ok'=>true, 'id'=>$stmt->insert_id, 'imagen'=>$imagenPath], JSON_UNESCAPED_UNICODE);
