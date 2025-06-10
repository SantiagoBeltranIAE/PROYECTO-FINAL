<?php
require "../models/Producto.php"; 

$productoModel = new Producto($pdo); 

function obtenerProductos() {
    global $productoModel;
    echo json_encode($productoModel->obtenerTodos());
}
function agregarProducto() {
    global $productoModel;

    $name = $_POST["name"] ?? '';
    $description = $_POST["description"] ?? '';
    $price = $_POST["price"] ?? '';

    if ($name && $description && $price) {
        if ($productoModel->agregar($name, $description, $price)) {
            echo json_encode(["Producto agregado"]);
        } else {
            echo json_encode(["Error al agregar el producto"]);
        }
    } else {
        echo json_encode(["Faltan datos obligatorios"]);
    }
} 
function editarProducto() {
    global $productoModel;
    $id = $_POST["id"] ?? '';
    $name = $_POST["name"] ?? '';
    $description = $_POST["description"] ?? '';
    $price = $_POST["price"] ?? '';

    if ($id && $name && $description && $price) {
        if ($productoModel->editar($id, $name, $description, $price)) {
            echo json_encode(["Producto editado"]);
        } else {
            echo json_encode(["Error al editar el producto"]);
        }
    } else {
        echo json_encode(["Faltan datos obligatorios"]);
    }
}

function eliminarProducto() {
    global $productoModel;
    $id = $_POST["id"] ?? '';
    if ($id) {
        if ($productoModel->eliminar($id)) {
            echo json_encode(["Producto eliminado"]);
        } else {
            echo json_encode(["Error al eliminar el producto"]);
        }
    } else {
        echo json_encode(["Faltan datos obligatorios"]);
    }

}
?>