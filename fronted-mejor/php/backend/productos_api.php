<?php
<?php
require __DIR__ . '/controllers/productos.php';

$action = $_REQUEST['action'] ?? ($_POST['action'] ?? null);
header('Content-Type: application/json; charset=utf-8');

try {
    if (!$action) throw new Exception('action required');
    switch ($action) {
        case 'agregarProducto': agregarProducto(); break;
        case 'editarProducto': editarProducto(); break;
        case 'eliminarProducto': eliminarProducto(); break;
        case 'obtenerProductos': obtenerProductos(); break;
        default: throw new Exception('Acción no soportada: '.$action);
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['ok'=>false,'msg'=>$e->getMessage()]);
}
?>