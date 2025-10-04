<?php
// Desactiva la visualización de errores en pantalla
ini_set("display_errors", 0);

// Activa el log de errores
ini_set("log_errors", 1);

// Aca se define ruta del archivo donde se guardarán los errores
ini_set("error_log", __DIR__ . "/mi_log_error.log");
?>
