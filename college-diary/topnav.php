<?php session_start(); ?>
<nav style="background: #2c3e50; padding: 10px; display: flex; justify-content: space-between; align-items: center; color: #ecf0f1;">
    <a href="index.php" style="color: #ecf0f1; text-decoration: none; font-size: 1.2em;">Электронный дневник</a>
    <div style="display: flex; align-items: center;">
        <form method="post" action="search-result.php" style="margin-right: 20px;">
            <input type="text" name="searchdata" placeholder="Поиск..." style="padding: 5px; border: none; border-radius: 3px;" required>
            <button type="submit" style="padding: 5px 10px; background: #3498db; border: none; color: #fff; border-radius: 3px;"><i class="fas fa-search"></i></button>
        </form>
        <div style="position: relative;">
            <a href="#" style="color: #ecf0f1;" onclick="toggleDropdown()"><i class="fas fa-user"></i></a>
            <div id="dropdown" style="display: none; position: absolute; right: 0; background: #34495e; color: #ecf0f1; border-radius: 3px; padding: 10px;">
                <a href="change-password.php" style="display: block; color: #ecf0f1; text-decoration: none; padding: 5px;">Сменить пароль</a>
                <a href="my-profile.php" style="display: block; color: #ecf0f1; text-decoration: none; padding: 5px;">Мой профиль</a>
                <a href="logout.php" style="display: block; color: #ecf0f1; text-decoration: none; padding: 5px;">Выйти</a>
            </div>
        </div>
    </div>
</nav>
<script>
function toggleDropdown() {
    const dropdown = document.getElementById('dropdown');
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}
</script>