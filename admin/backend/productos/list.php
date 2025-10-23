<?php
// backend/productos/list.php
require_once __DIR__."/../config/conexion.php";
require_once __DIR__."/../config/session.php";
exigir_auth();

$q = "SELECT id_producto, nombre, descripcion, categoria, precio, imagen_url, personalizable, tamanos_precios
      FROM producto ORDER BY categoria, nombre";
$res = $mysqli->query($q);

$data = [];
while ($row = $res->fetch_assoc()) {
  if (!empty($row["tamanos_precios"])) {
    $row["tamanos_precios"] = json_decode($row["tamanos_precios"], true);
  }
  $data[] = $row;
}
echo json_encode($data);
