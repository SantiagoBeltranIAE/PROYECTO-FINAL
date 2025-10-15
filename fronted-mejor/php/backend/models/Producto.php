<?php
require "../config/database.php"; 

class Producto {
    private $pdo; 

    public function __construct($pdo) {
        $this->pdo = $pdo;  
    }
    
    // ******************************************************
    // CÓDIGO ACTUALIZADO PARA RESOLVER LOS VALORES 'UNDEFINED'
    // ******************************************************
    public function obtenerTodos() {

        $query = "SELECT 
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

public function eliminar($id) {
    $stmt = $this->pdo->prepare("DELETE FROM products WHERE id = ?");
    return $stmt->execute([$id]);
}
} 
?>