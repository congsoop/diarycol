<?php
require 'db.php';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'];
    $password = $_POST['password'];
    $role = $_POST['role'];
    $stmt = $pdo->prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)");
    try {
        $stmt->execute([$username, $password, $role]);
        header("Location: login.php");
        exit;
    } catch (PDOException $e) {
        $error = "Пользователь уже существует";
    }
}
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Регистрация</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h2>Регистрация</h2>
    <?php if (isset($error)) echo "<p>$error</p>"; ?>
    <form method="POST">
        <input type="text" name="username" placeholder="Логин" required><br>
        <input type="password" name="password" placeholder="Пароль" required><br>
        <select name="role">
            <option value="student">Студент</option>
            <option value="teacher">Преподаватель</option>
        </select><br>
        <button type="submit">Зарегистрироваться</button>
        <a href="login.php"><button type="button">Назад</button></a>
    </form>
</body>
</html>