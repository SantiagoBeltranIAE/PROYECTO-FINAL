<?php
$conexion = new mysqli("localhost", "root", "", "vanella_delivery");
if ($conexion->connect_error) {
    die("Error de conexión: " . $conexion->connect_error);
}

$nombre = $_POST['nombre'] ?? '';
$puntuacion = $_POST['puntuacion'] ?? 0;
$opinion = $_POST['opinion'] ?? '';

if ($nombre && $puntuacion && $opinion) {
    $stmt = $conexion->prepare("INSERT INTO opiniones (nombre, puntuacion, opinion) VALUES (?, ?, ?)");
    $stmt->bind_param("sis", $nombre, $puntuacion, $opinion);
    $stmt->execute();
    $stmt->close();
    echo "ok";
} else {
    echo "error";
}
$conexion->close();
?>