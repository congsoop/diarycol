<?php
session_start();
require 'db.php';
if ($_SESSION['user']['role'] !== 'teacher') exit;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $subject = $_POST['subject'];
    $grade = $_POST['grade'];
    $date = date('d.m.Y');
    $stmt = $pdo->prepare("INSERT INTO grades (username, subject, grade, date) VALUES (?, ?, ?, ?)");
    $stmt->execute([$_SESSION['user']['username'], $subject, $grade, $date]);
    $stmt = $pdo->prepare("INSERT INTO notifications (username, message, date) VALUES (?, ?, ?)");
    $stmt->execute([$_SESSION['user']['username'], "Добавлена оценка: $grade по $subject", $date]);
}

if (isset($_GET['delete'])) {
    $id = $_GET['delete'];
    $stmt = $pdo->prepare("DELETE FROM grades WHERE id = ?");
    $stmt->execute([$id]);
}

header("Location: index.php");
exit;
?>