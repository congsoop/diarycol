<?php
// Этот файл не используется напрямую в текущей версии, но оставлен для возможного расширения
session_start();
require 'db.php';
header("Location: index.php");
exit;
?>