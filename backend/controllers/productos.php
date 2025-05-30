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
?>