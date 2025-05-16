<?php
require_once 'includes/auth.php';
if (!is_logged_in()) {
    header('Location: index.php');
    exit;
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>Dashboard</title>
</head>
<body>
    <h1>Bienvenido, <?= $_SESSION['user']['username'] ?></h1>
    <p>Rol: <?= $_SESSION['user']['role'] ?></p>

    <a href="logout.php">Cerrar sesión</a>

    <?php if (is_admin()): ?>
        <h2>Panel de Administración</h2>
        <a href="admin/add_product.php">Agregar producto</a>
        <!-- También mostrar productos con botones de editar y eliminar -->
    <?php else: ?>
        <h2>Menú de productos</h2>
        <!-- Mostrar productos disponibles -->
    <?php endif; ?>
</body>
</html>
