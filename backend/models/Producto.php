<?php
require "../config/database.php"; 

class Producto {
    private $pdo; 

    public function __construct($pdo) {
        $this->pdo = $pdo;  
    }
    public function obtenerTodos() {
        $query = "SELECT * FROM products";
        $stmt = $this->pdo->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);       
    }       
    public function agregar($name, $description, $price) {
        $stmt = $this->pdo->prepare("INSERT INTO products (name, description, price) VALUES (?, ?, ?)");
        return $stmt->execute([
            $name,
            $description,
            $price
        ]);
    }      
    public function editar($id, $name, $description, $price) {
    $stmt = $this->pdo->prepare("UPDATE products SET name = ?, description = ?, price = ? WHERE id = ?");
    return $stmt->execute([
        $name,
        $description,
        $price,
        $id
    ]);
}
} 
?>