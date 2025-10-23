<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate');

/* incluir posible archivo de conexión (usa la conexión admin si existe) */
$possible = [
  __DIR__ . '/../../admin/backend/config/conexion.php',
  __DIR__ . '/../db.php',
  __DIR__ . '/../../db.php',
  __DIR__ . '/../../fronted-mejor/php/config/database.php',
  __DIR__ . '/../../fronted-mejor/config/database.php',
];

$loaded = false;
foreach ($possible as $p) {
  if (file_exists($p)) {
    require_once $p;
    $loaded = true;
    break;
  }
}
if (!$loaded) {
  http_response_code(500);
  echo json_encode(['ok' => false, 'msg' => 'Archivo de conexión no encontrado. Rutas probadas: ' . implode(', ', $possible)]);
  exit;
}

/* determinar esquema y comprobar tabla producto */
$schema = null;
if (isset($DB_NAME)) $schema = $DB_NAME;
if (!$schema && isset($mysqli) && ($mysqli instanceof mysqli)) {
  $r = $mysqli->query("SELECT DATABASE() AS db");
  $row = $r ? $r->fetch_assoc() : null;
  $schema = $row['db'] ?? null;
}
if (!$schema && isset($db) && ($db instanceof PDO)) {
  try { $schema = $db->query("SELECT DATABASE()")->fetchColumn(); } catch(Exception $e) {}
}

$table = 'producto';

try {
  $tableExists = false;
  if (isset($mysqli)) {
    $stmt = $mysqli->prepare("SELECT COUNT(*) AS cnt FROM information_schema.tables WHERE table_schema = ? AND table_name = ? LIMIT 1");
    $stmt->bind_param('ss', $schema, $table);
    $stmt->execute();
    $r = $stmt->get_result()->fetch_assoc();
    $tableExists = !empty($r['cnt']);
  } elseif (isset($db)) {
    $stmt = $db->prepare("SELECT COUNT(*) AS cnt FROM information_schema.tables WHERE table_schema = ? AND table_name = ? LIMIT 1");
    $stmt->execute([$schema, $table]);
    $r = $stmt->fetch(PDO::FETCH_ASSOC);
    $tableExists = !empty($r['cnt']);
  }

  if (!$tableExists) {
    // devolver lista de tablas para que identifiques la correcta
    if (isset($mysqli)) {
      $res = $mysqli->query("SELECT table_name FROM information_schema.tables WHERE table_schema = '".$mysqli->real_escape_string($schema)."'");
      $tables = [];
      while ($rw = $res->fetch_assoc()) $tables[] = $rw['table_name'];
    } else {
      $stmt = $db->prepare("SELECT table_name FROM information_schema.tables WHERE table_schema = ?");
      $stmt->execute([$schema]);
      $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    }
    http_response_code(500);
    echo json_encode(['ok'=>false,'msg'=>"Tabla 'producto' no encontrada. Tablas en la BD:","tables"=>$tables]);
    exit;
  }

  // obtener columnas reales de la tabla
  if (isset($mysqli)) {
    $colsRes = $mysqli->query("SHOW COLUMNS FROM `{$table}`");
    $cols = [];
    while ($c = $colsRes->fetch_assoc()) $cols[] = $c['Field'];
  } else {
    $stmt = $db->query("SHOW COLUMNS FROM `{$table}`");
    $cols = $stmt->fetchAll(PDO::FETCH_COLUMN);
  }

  // helper para mapear
  $find = function(array $candidates) use ($cols) {
    foreach ($candidates as $c) if (in_array($c, $cols, true)) return $c;
    return null;
  };

  $col_id = $find(['id','id_producto','ID','id_p','producto_id','idProducto']);
  $col_name = $find(['name','nombre','title','producto','nombre_producto']);
  $col_description = $find(['description','descripcion','detail','info','desc']);
  $col_price = $find(['price','precio','price_cents','precio_cents','valor']);
  $col_image = $find(['image','imagen','img','foto']);
  $col_categoria = $find(['categoria','tipo','category','categoria_id','categoria_nombre']);
  $col_activo = $find(['activo','active','enabled','status']);

  // si faltan columnas críticas, no romper: usar la primera columna disponible como id/name
  if (!$col_id) $col_id = $cols[0] ?? null;
  if (!$col_name) $col_name = $cols[1] ?? $col_id;
  // construir select dinámico con alias
  $select = [];
  $select[] = $col_id ? "`{$col_id}` AS id" : "NULL AS id";
  $select[] = $col_name ? "`{$col_name}` AS name" : "NULL AS name";
  $select[] = $col_description ? "`{$col_description}` AS description" : "NULL AS description";
  $select[] = $col_price ? "`{$col_price}` AS price" : "NULL AS price";
  $select[] = $col_image ? "`{$col_image}` AS image" : "NULL AS image";
  $select[] = $col_categoria ? "`{$col_categoria}` AS categoria" : "NULL AS categoria";
  // construir WHERE si existe columna activo
  $where = $col_activo ? "WHERE COALESCE(`{$col_activo}`,1)=1" : "";

  $sql = "SELECT ".implode(", ", $select)." FROM `{$table}` {$where} ORDER BY COALESCE(`{$col_categoria}`,'zzzz'), COALESCE(`{$col_name}`,'')";

  if (isset($mysqli)) {
    $res = $mysqli->query($sql);
    if ($res === false) throw new Exception($mysqli->error);
    $rows = $res->fetch_all(MYSQLI_ASSOC);
    echo json_encode($rows, JSON_UNESCAPED_UNICODE);
    exit;
  } else {
    $stmt = $db->query($sql);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($rows, JSON_UNESCAPED_UNICODE);
    exit;
  }

} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['ok'=>false,'msg'=>'DB error','error'=>$e->getMessage()]);
  exit;
}