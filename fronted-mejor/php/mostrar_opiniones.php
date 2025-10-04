<?php
$conexion = new mysqli("localhost", "root", "", "vanella_delivery");
if ($conexion->connect_error) {
    die("Error de conexión: " . $conexion->connect_error);
}

$sql = "SELECT nombre, puntuacion, opinion, fecha FROM opiniones ORDER BY fecha DESC";
$resultado = $conexion->query($sql);

if ($resultado->num_rows > 0) {
    while($fila = $resultado->fetch_assoc()) {
        $estrellas = str_repeat('⭐', intval($fila['puntuacion']));
        echo '<div class="border p-3 rounded bg-light mb-3">';
        echo '<h5>' . htmlspecialchars($fila['nombre']) . '</h5>';
        echo '<p class="mb-1">' . $estrellas . '</p>';
        echo '<p>' . htmlspecialchars($fila['opinion']) . '</p>';
        echo '<small class="text-muted">' . $fila['fecha'] . '</small>';
        echo '</div>';
    }
} else {
    echo "<p>No hay opiniones aún.</p>";
}
$conexion->close();
?>