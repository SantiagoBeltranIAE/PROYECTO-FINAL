<?php
// Configura la cabecera para asegurar que el navegador sepa que es JSON
header('Content-Type: application/json');

// ******************************************************
// CONEXIÓN Y CONFIGURACIÓN (usando los mismos datos que opiniones.php)
// ******************************************************
$host = "localhost";      
$dbname = "vanella_delivery"; 
$username = "root";        
$password = "";          

$conexion = new mysqli($host, $username, $password, $dbname);

if ($conexion->connect_error) {
    // Si falla la conexión, devuelve un JSON de error
    echo json_encode(["error" => "Error de conexión: " . $conexion->connect_error]);
    exit();
}

// ******************************************************
// CONSULTA A LA BASE DE DATOS
// ******************************************************
// IMPORTANTE: Asegúrate de que las columnas existan en tu tabla 'products'.
// Se usan alias (AS) para coincidir con los nombres de objeto que usa tu JS.
$sql = "SELECT 
            id_producto AS id, 
            nombre, 
            descripcion, 
            precio, 
            categoria,
            imagen_url,
            personalizable, 
            tamanos_precios 
        FROM producto
        ORDER BY categoria, id_producto";

$resultado = $conexion->query($sql);
$productos = [];

if ($resultado->num_rows > 0) {
    while($fila = $resultado->fetch_assoc()) {
        // Almacena cada producto en el array
        $productos[] = $fila;
    }
}

$conexion->close();

// ******************************************************
// DEVOLVER EL ARRAY COMO JSON (lo que consume el JS)
// ******************************************************
echo json_encode($productos);
?>