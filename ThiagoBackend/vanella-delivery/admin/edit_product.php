<?php
require_once '../includes/auth.php';
require_once '../includes/db.php';

if (!is_admin()) {
    header('Location: ../dashboard.php');
    exit;
}

$id = $_GET['id'];
$product = $pdo->prepare("SELECT * FROM products WHERE id = ?");
$product->execute([$id]);
$data = $product->fetch();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $stmt = $pdo->prepare("UPDATE products SET name=?, description=?, price=? WHERE id=?");
    $stmt->execute([$_POST['name'], $_POST['description'], $_POST['price'], $id]);
    header('Location: ../dashboard.php');
    exit;
}
?>

<form method="post">
    <input name="name" value="<?php echo $data['name']; ?>" required><br>
    <textarea name="description"><?php echo $data['description']; ?></textarea><br>
    <input name="price" type="number" step="0.01" value="<?php echo $data['price']; ?>" required><br>
    <button type="submit">Guardar</button>
</form>
