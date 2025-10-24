<?php
// Script puntual para corregir AUTO_INCREMENT en tablas
// Visita: http://localhost/PROYECTO-FINAL/admin/backend/scripts/fix_schema.php

error_reporting(E_ERROR | E_PARSE);
ini_set('display_errors', 0);
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/conexion.php';

$out = [ 'ok' => true, 'changes' => [] ];

function apply($mysqli, $sql, $label, &$out) {
  if ($mysqli->query($sql)) {
    $out['changes'][] = $label . ' OK';
    return true;
  } else {
    // Si ya estaba ok, MySQL puede devolver error
    $out['changes'][] = $label . ' => ' . $mysqli->error;
    return false;
  }
}

// Asegurar PK existe
apply($mysqli, "ALTER TABLE `pedido_detalle` ADD PRIMARY KEY (`id`)", 'pedido_detalle: ADD PRIMARY KEY', $out);
// Asegurar índice id_pedido
apply($mysqli, "ALTER TABLE `pedido_detalle` ADD KEY `idx_ped_det_pedido` (`id_pedido`)", 'pedido_detalle: ADD INDEX id_pedido', $out);
// Corregir AUTO_INCREMENT en id
apply($mysqli, "ALTER TABLE `pedido_detalle` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT", 'pedido_detalle: AUTO_INCREMENT id', $out);

// Preventivo: historial
apply($mysqli, "ALTER TABLE `pedido_historial` ADD PRIMARY KEY (`id`)", 'pedido_historial: ADD PRIMARY KEY', $out);
apply($mysqli, "ALTER TABLE `pedido_historial` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT", 'pedido_historial: AUTO_INCREMENT id', $out);

echo json_encode($out);
