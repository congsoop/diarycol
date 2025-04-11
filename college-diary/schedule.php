<?php
session_start();
require 'db.php';
if ($_SESSION['user']['role'] !== 'teacher') exit;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $day = $_POST['day'];
    $subject = $_POST['subject'];
    $time = $_POST['time'];
    $stmt = $pdo->prepare("INSERT INTO schedule (day, subject, time) VALUES (?, ?, ?)");
    $stmt->execute([$day, $subject, $time]);
    $stmt = $pdo->prepare("INSERT INTO notifications (username, message, date) VALUES (?, ?, ?)");
    $stmt->execute([$_SESSION['user']['username'], "Добавлено расписание: $subject на $day в $time", date('d.m.Y')]);
}

if (isset($_GET['delete'])) {
    $id = $_GET['delete'];
    $stmt = $pdo->prepare("DELETE FROM schedule WHERE id = ?");
    $stmt->execute([$id]);
}

header("Location: index.php");
exit;
?>