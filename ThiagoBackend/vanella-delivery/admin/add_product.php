<?php
require_once '../includes/auth.php';
require_once '../includes/db.php';

if (!is_admin()) {
    header('Location: ../dashboard.php');
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $stmt = $pdo->prepare("INSERT INTO products (name, description, price) VALUES (?, ?, ?)");
    $stmt->execute([$_POST['name'], $_POST['description'], $_POST['price']]);
    header('Location: ../dashboard.php');
    exit;
}
?>

<form method="post">
    <input name="name" placeholder="Nombre del producto" required><br>
    <textarea name="description" placeholder="Descripción"></textarea><br>
    <input name="price" type="number" step="0.01" placeholder="Precio" required><br>
    <button type="submit">Agregar</button>
</form>
