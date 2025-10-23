<?php
// backend/auth/logout.php
require_once __DIR__."/../config/session.php";
session_destroy();
echo json_encode(["ok" => true]);
