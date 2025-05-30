<?php
require "../controllers/productos.php";

$requestMethod = $_SERVER["REQUEST_METHOD"];
$seccion = $_GET["seccion"] ?? null;

if ($requestMethod == "POST") {
    if ($seccion == "añadirProducto") {
        agregarProducto();
    } else if ($seccion == "eliminarProducto") {
        eliminarProducto();
    } else {
        echo "Sección POST no válida o no especificada.";
    }
}

if ($requestMethod == "GET") {
    if ($seccion == "productos") {
        obtenerProductos();
    } else {
        echo "Sección GET no válida o no especificada.";
    }
}
?>