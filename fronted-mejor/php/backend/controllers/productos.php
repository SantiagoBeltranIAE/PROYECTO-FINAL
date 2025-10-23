<?php
require __DIR__ . '/../models/Producto.php';

/* Instancia del modelo */
$productoModel = null;
try {
    $productoModel = new Producto($pdo ?? null);
} catch (Throwable $e) {
    try { $productoModel = new Producto(); } catch (Throwable $e2) {}
}

/* Categorías del select en Admin */
$ALLOWED_CATEGORIES = ['Hamburguesas', 'Papas Fritas', 'Tacos', 'Toppings'];

/* Helpers JSON */
function jsonOk(array $data = []): void {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['ok' => true] + $data, JSON_UNESCAPED_UNICODE);
    exit;
}
function jsonError(string $msg, int $code = 400): void {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['ok' => false, 'msg' => $msg], JSON_UNESCAPED_UNICODE);
    exit;
}

/* URL absoluta para imágenes */
function buildImageUrl(?string $img): ?string {
  $placeholder = '/PROYECTO-FINAL/imagenes/placeholder.png';
  if (!$img) return $placeholder;

  // Si es absoluta, devuélvela tal cual
  if (preg_match('#^https?://#i', $img)) return $img;

  // Quitar prefijos ./ y espacios extra
  $img = trim($img);
  $img = preg_replace('#^\.\/#','', $img);

  // Evitar .heic/.heif -> .jpg
  $img = preg_replace('/\.(heic|heif)$/i', '.jpg', $img);

  // Separar dir y archivo y URL-encode del nombre (maneja espacios)
  $dir  = str_replace('\\','/', dirname($img));
  $file = basename($img);
  $file = rawurlencode($file);
  $path = ($dir === '.' ? '' : $dir.'/') . $file;

  // Asegurar prefijo de proyecto
  if ($path[0] !== '/') $path = '/PROYECTO-FINAL/' . $path;

  return $path ?: $placeholder;
}

/* Subida de archivo (name="imagen") -> ruta relativa pública */
function handleUploadImage(): ?string {
    if (empty($_FILES['imagen']['tmp_name'])) return null;

    $docRoot    = rtrim($_SERVER['DOCUMENT_ROOT'] ?? '', '/\\');
    $uploadsDir = $docRoot . '/PROYECTO-FINAL/uploads/products';
    if (!is_dir($uploadsDir)) @mkdir($uploadsDir, 0755, true);
    if (!is_dir($uploadsDir) || !is_writable($uploadsDir)) return null;

    $fname = basename($_FILES['imagen']['name']);
    $safe  = time() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', $fname);
    $dest  = $uploadsDir . '/' . $safe;

    if (@move_uploaded_file($_FILES['imagen']['tmp_name'], $dest)) {
        return '/PROYECTO-FINAL/uploads/products/' . $safe;
    }
    return null;
}

/* ========== Acciones ========== */

function obtenerProductos(): void {
    global $productoModel;
    if (!$productoModel) jsonError('Modelo no disponible', 500);

    try {
        $rows = $productoModel->obtenerTodos();
        $placeholder = '/PROYECTO-FINAL/imagenes/placeholder.png';

        $rows = array_map(function ($r) use ($placeholder) {
            $img = $r['imagen'] ?? $r['imagen_url'] ?? null;
            $imagenAbs = buildImageUrl($img) ?? buildImageUrl($placeholder);
            return [
                'id_producto'     => $r['id_producto'] ?? null,
                'nombre'          => $r['nombre'] ?? '',
                'descripcion'     => $r['descripcion'] ?? '',
                'precio'          => $r['precio'] ?? 0,
                'categoria'       => $r['categoria'] ?? '',
                'personalizable'  => isset($r['personalizable']) ? (int)$r['personalizable'] : 0,
                'tamanos_precios' => $r['tamanos_precios'] ?? null,
                'imagen'          => $imagenAbs
            ];
        }, $rows);

        jsonOk(['products' => $rows]);
    } catch (Throwable $e) {
        jsonError('Error al obtener productos: ' . $e->getMessage(), 500);
    }
}

function agregarProducto(): void {
    global $productoModel, $ALLOWED_CATEGORIES;
    if (!$productoModel) jsonError('Modelo no disponible', 500);

    $nombre          = trim($_POST['nombre'] ?? '');
    $descripcion     = trim($_POST['descripcion'] ?? '');
    $precio          = $_POST['precio'] ?? null;
    $categoria       = trim($_POST['categoria'] ?? '');
    $personalizable  = isset($_POST['personalizable']) ? (int)$_POST['personalizable'] : 0;
    $tamanos_precios = $_POST['tamanos_precios'] ?? null;
    $imagen_url      = trim($_POST['imagen_url'] ?? '');

    if ($categoria !== '' && !in_array($categoria, $ALLOWED_CATEGORIES, true)) $categoria = '';

    if ($upload = handleUploadImage()) $imagen_url = $upload;

    if ($imagen_url && !preg_match('#^https?://#i', $imagen_url) && strpos($imagen_url, '/') !== 0) {
        $imagen_url = '/' . ltrim($imagen_url, '/');
    }

    if ($nombre === '' || $precio === null) jsonError('Faltan datos (nombre/precio).');

    // normalizar/validar tamanos_precios:
    if (is_string($tamanos_precios)) {
        $t = trim($tamanos_precios);
        if ($t === '') {
            $tamanos_precios = null;
        } else {
            $decoded = json_decode($t, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                // si es array vacío, convertir a null (evita violar constraints que exigen non-empty)
                if (is_array($decoded) && count($decoded) === 0) {
                    $tamanos_precios = null;
                } else {
                    $tamanos_precios = json_encode($decoded, JSON_UNESCAPED_UNICODE);
                }
            } else {
                // no es JSON válido -> evitar enviar valor inválido a la BD
                $tamanos_precios = null;
            }
        }
    } elseif (is_array($tamanos_precios)) {
        if (count($tamanos_precios) === 0) $tamanos_precios = null;
        else $tamanos_precios = json_encode($tamanos_precios, JSON_UNESCAPED_UNICODE);
    }

    try {
        $id = $productoModel->agregar([
            'nombre'          => $nombre,
            'descripcion'     => $descripcion,
            'precio'          => $precio,
            'categoria'       => $categoria,
            'personalizable'  => $personalizable,
            'tamanos_precios' => $tamanos_precios,
            'imagen'          => $imagen_url
        ]);
        if ($id) jsonOk(['msg' => 'Producto agregado', 'id_producto' => (int)$id]);
        jsonError('No se pudo agregar', 500);
    } catch (Throwable $e) {
        jsonError('Error al agregar: ' . $e->getMessage(), 500);
    }
}

function editarProducto(): void {
    global $productoModel, $ALLOWED_CATEGORIES;
    if (!$productoModel) jsonError('Modelo no disponible', 500);

    $id              = $_POST['id_producto'] ?? $_POST['id'] ?? '';
    $nombre          = trim($_POST['nombre'] ?? '');
    $descripcion     = trim($_POST['descripcion'] ?? '');
    $precio          = $_POST['precio'] ?? null;
    $categoria       = trim($_POST['categoria'] ?? '');
    $personalizable  = isset($_POST['personalizable']) ? (int)$_POST['personalizable'] : null;
    $tamanos_precios = $_POST['tamanos_precios'] ?? null;
    $imagen_url      = trim($_POST['imagen_url'] ?? '');

    if (!$id) jsonError('id_producto requerido');
    if ($categoria !== '' && !in_array($categoria, $ALLOWED_CATEGORIES, true)) $categoria = '';

    if ($upload = handleUploadImage()) $imagen_url = $upload;

    if ($imagen_url && !preg_match('#^https?://#i', $imagen_url) && strpos($imagen_url, '/') !== 0) {
        $imagen_url = '/' . ltrim($imagen_url, '/');
    }

    $data = [
        'nombre'          => $nombre,
        'descripcion'     => $descripcion,
        'precio'          => $precio,
        'categoria'       => $categoria,
        'personalizable'  => $personalizable,
        'tamanos_precios' => $tamanos_precios,
        'imagen'          => $imagen_url
    ];

    try {
        $ok = $productoModel->editar($id, $data);
        if ($ok) jsonOk(['msg' => 'Producto editado']);
        jsonError('No se pudo editar', 500);
    } catch (Throwable $e) {
        jsonError('Error al editar: ' . $e->getMessage(), 500);
    }
}

function eliminarProducto(): void {
    global $productoModel;
    if (!$productoModel) jsonError('Modelo no disponible', 500);

    $id = $_POST['id_producto'] ?? $_POST['id'] ?? '';
    if (!$id) jsonError('id_producto requerido');

    try {
        if ($productoModel->eliminar($id)) jsonOk(['msg' => 'Producto eliminado']);
        jsonError('No se pudo eliminar', 500);
    } catch (Throwable $e) {
        jsonError('Error al eliminar: ' . $e->getMessage(), 500);
    }
}

/* Dispatcher (?action=...) */
$action = $_REQUEST['action'] ?? null;
if ($action) {
    switch ($action) {
        case 'obtenerProductos': obtenerProductos(); break;
        case 'agregarProducto':  agregarProducto();  break;
        case 'editarProducto':   editarProducto();   break;
        case 'eliminarProducto': eliminarProducto(); break;
        default: jsonError('Acción no soportada: ' . $action, 400);
    }
} else {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        obtenerProductos();
    } else {
        jsonError('Parámetro action requerido', 400);
    }
}
?>
const btn = document.getElementById('btn-que-antes-usabas');
if (btn) btn.onclick = () => { /* ... */ };