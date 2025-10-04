<?php
$conexion = new mysqli("localhost", "root", "", "vanella_delivery");
if ($conexion->connect_error) {
    die("Error de conexión: " . $conexion->connect_error);
}

$nombre = isset($_POST['nombre']) ? trim($_POST['nombre']) : '';
$puntuacion = isset($_POST['puntuacion']) ? intval($_POST['puntuacion']) : 0;
$opinion = isset($_POST['opinion']) ? trim($_POST['opinion']) : '';

if ($nombre !== '' && $puntuacion > 0 && $opinion !== '') {
    $stmt = $conexion->prepare("INSERT INTO opiniones (nombre, puntuacion, opinion, fecha) VALUES (?, ?, ?, NOW())");
    $stmt->bind_param("sis", $nombre, $puntuacion, $opinion);
    if ($stmt->execute()) {
        echo "ok";
    } else {
        echo "error";
    }
    $stmt->close();
} else {
    echo "error";
}
$conexion->close();
?>