<?php
class Producto {
    private PDO $pdo;

    public function __construct(?PDO $pdo = null) {
        if ($pdo instanceof PDO) {
            $this->pdo = $pdo;
        } else {
            $cfg = __DIR__ . '/../config/database.php';
            if (is_file($cfg)) include $cfg; // si define $pdo lo toma
            if (isset($pdo) && $pdo instanceof PDO) {
                $this->pdo = $pdo;
            } elseif (isset($GLOBALS['pdo']) && $GLOBALS['pdo'] instanceof PDO) {
                $this->pdo = $GLOBALS['pdo'];
            } else {
                // usa tu base real
                $this->pdo = new PDO('mysql:host=localhost;dbname=vanella_delivery;charset=utf8mb4', 'root', '');
            }
        }
        $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $this->pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    }

    public function obtenerTodos(): array {
        $sql = "SELECT
                    id_producto,
                    nombre,
                    descripcion,
                    precio,
                    categoria,
                    personalizable,
                    tamanos_precios,
                    imagen_url AS imagen
                FROM producto
                ORDER BY id_producto ASC";
        return $this->pdo->query($sql)->fetchAll();
    }

    public function obtenerPorId($id): ?array {
        $sql = "SELECT
                    id_producto,
                    nombre,
                    descripcion,
                    precio,
                    categoria,
                    personalizable,
                    tamanos_precios,
                    imagen_url AS imagen
                FROM producto
                WHERE id_producto = :id
                LIMIT 1";
        $st = $this->pdo->prepare($sql);
        $st->execute([':id' => $id]);
        $row = $st->fetch();
        return $row ?: null;
    }

    public function agregar(array $data): ?int {
        $img = $data['imagen'] ?? $data['imagen_url'] ?? null;
        $sql = "INSERT INTO producto
                    (nombre, descripcion, precio, categoria, personalizable, tamanos_precios, imagen_url)
                VALUES
                    (:nombre, :descripcion, :precio, :categoria, :personalizable, :tamanos_precios, :imagen_url)";
        $st = $this->pdo->prepare($sql);
        $st->execute([
            ':nombre'          => $data['nombre'] ?? '',
            ':descripcion'     => $data['descripcion'] ?? '',
            ':precio'          => $data['precio'] ?? 0,
            ':categoria'       => $data['categoria'] ?? '',
            ':personalizable'  => $data['personalizable'] ?? 0,
            ':tamanos_precios' => $data['tamanos_precios'] ?? null,
            ':imagen_url'      => $img,
        ]);
        $id = $this->pdo->lastInsertId();
        return $id ? (int)$id : null;
    }

    public function editar($id, array $data): bool {
        if (!$id) return false;

        if (array_key_exists('imagen', $data) && !array_key_exists('imagen_url', $data)) {
            $data['imagen_url'] = $data['imagen'];
            unset($data['imagen']);
        }

        $allowed = ['nombre','descripcion','precio','categoria','personalizable','tamanos_precios','imagen_url'];
        $sets = [];
        $params = [':id' => $id];
        foreach ($allowed as $k) {
            if (array_key_exists($k, $data) && $data[$k] !== null && $data[$k] !== '') {
                $sets[] = "$k = :$k";
                $params[":$k"] = $data[$k];
            }
        }
        if (!$sets) return false;

        $sql = "UPDATE producto SET ".implode(', ', $sets)." WHERE id_producto = :id";
        $st = $this->pdo->prepare($sql);
        return $st->execute($params);
    }

    public function eliminar($id): bool {
        $st = $this->pdo->prepare("DELETE FROM producto WHERE id_producto = ?");
        return $st->execute([$id]);
    }
}
?>