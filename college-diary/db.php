<?php
$host = 'localhost'; // Замените на ваш хост
$dbname = 'college_diary'; // Название базы данных
$username = 'root'; // Имя пользователя MySQL
$password = ''; // Пароль MySQL

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->exec("CREATE TABLE IF NOT EXISTS users (username VARCHAR(50) PRIMARY KEY, password VARCHAR(50), role ENUM('student', 'teacher'))");
    $pdo->exec("CREATE TABLE IF NOT EXISTS schedule (id INT AUTO_INCREMENT PRIMARY KEY, day VARCHAR(50), subject VARCHAR(50), time VARCHAR(50))");
    $pdo->exec("CREATE TABLE IF NOT EXISTS grades (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(50), subject VARCHAR(50), grade INT, date VARCHAR(50))");
    $pdo->exec("CREATE TABLE IF NOT EXISTS notifications (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(50), message TEXT, date VARCHAR(50))");
} catch (PDOException $e) {
    die("Ошибка подключения: " . $e->getMessage());
}
?>