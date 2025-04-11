<?php
session_start();
include 'db_connection.php';
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit();
}
$user_id = $_SESSION['user_id'];
$query = mysqli_query($con, "SELECT firstName, lastName, role FROM users WHERE id='$user_id'");
$user = mysqli_fetch_array($query);
$fullname = $user['firstName'] . " " . $user['lastName'];
$role = $user['role'];
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Электронный дневник</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    <style>
        body { margin: 0; font-family: Arial, sans-serif; background: #f0f2f5; display: flex; }
        #sidenav { width: 250px; height: 100vh; background: #2c3e50; color: #ecf0f1; position: fixed; }
        .nav { padding: 20px 0; }
        .heading { padding: 10px 20px; font-size: 0.9em; color: #bdc3c7; text-transform: uppercase; }
        .nav-link { display: flex; align-items: center; padding: 12px 20px; color: #ecf0f1; text-decoration: none; }
        .nav-link:hover { background: #34495e; }
        .icon { margin-right: 10px; width: 20px; text-align: center; }
        .collapse-arrow { margin-left: auto; transition: transform 0.3s; }
        .nav-link[aria-expanded="true"] .collapse-arrow { transform: rotate(-180deg); }
        .nested { background: #34495e; padding: 10px 0; display: none; }
        .nested .nav-link { padding: 10px 40px; }
        .footer { position: absolute; bottom: 0; width: 100%; padding: 15px 20px; background: #233342; font-size: 0.9em; }
        .small { color: #bdc3c7; }
        .content { margin-left: 250px; padding: 20px; width: 100%; }
        .teacher-only { display: <?php echo $role === 'teacher' ? 'block' : 'none'; ?>; }
    </style>
</head>
<body>
    <?php include 'topnav.php'; ?>
    <div id="sidenav">
        <div class="nav">
            <div class="heading">Основное</div>
            <a class="nav-link" href="index.php"><span class="icon"><i class="fas fa-home"></i></span>Главная</a>
            <a class="nav-link" href="#" onclick="toggleCollapse('collapseGrades')"><span class="icon"><i class="fas fa-columns"></i></span>Оценки<span class="collapse-arrow"><i class="fas fa-angle-down"></i></span></a>
            <div class="nested teacher-only" id="collapseGrades">
                <a class="nav-link" href="add-grades.php">Добавить</a>
                <a class="nav-link" href="manage-grades.php">Управление</a>
            </div>
            <a class="nav-link" href="#" onclick="toggleCollapse('collapseSchedule')"><span class="icon"><i class="fas fa-book-open"></i></span>Расписание<span class="collapse-arrow"><i class="fas fa-angle-down"></i></span></a>
            <div class="nested teacher-only" id="collapseSchedule">
                <a class="nav-link" href="add-schedule.php">Добавить</a>
                <a class="nav-link" href="manage-schedule.php">Управление</a>
            </div>
            <div class="heading">Настройки профиля</div>
            <a class="nav-link" href="change-password.php"><span class="icon"><i class="fa fa-cog"></i></span>Сменить пароль</a>
            <a class="nav-link" href="my-profile.php"><span class="icon"><i class="fa fa-user"></i></span>Мой профиль</a>
            <a class="nav-link" href="logout.php"><span class="icon"><i class="fa fa-sign-out-alt"></i></span>Выйти</a>
        </div>
        <div class="footer">
            <div class="small">Вы вошли как:</div>
            <?php echo $fullname; ?>
        </div>
    </div>
    <div class="content">
        <h1>Добро пожаловать, <?php echo $fullname; ?>!</h1>
        <p>Это главная страница вашего электронного дневника.</p>
    </div>
    <script>
        function toggleCollapse(id) {
            const elem = document.getElementById(id);
            elem.style.display = elem.style.display === 'block' ? 'none' : 'block';
        }
    </script>
</body>
</html>