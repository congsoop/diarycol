<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Электронный дневник</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    <style>
        body {
            margin: 0;
            font-family: 'Arial', sans-serif;
            background: #f0f2f5;
        }
        #layoutSidenav_nav {
            width: 250px;
            height: 100vh;
            background: #2c3e50;
            color: #ecf0f1;
            position: fixed;
            top: 0;
            left: 0;
            overflow-y: auto;
            box-shadow: 2px 0 5px rgba(0, 0, 0, 0.3);
        }
        .sb-sidenav-menu {
            padding: 20px 0;
        }
        .sb-sidenav-menu-heading {
            padding: 10px 20px;
            font-size: 0.9em;
            text-transform: uppercase;
            color: #bdc3c7;
            letter-spacing: 1px;
        }
        .nav-link {
            display: flex;
            align-items: center;
            padding: 12px 20px;
            color: #ecf0f1;
            text-decoration: none;
            transition: background 0.3s, padding-left 0.3s;
        }
        .nav-link:hover {
            background: #34495e;
            padding-left: 25px;
        }
        .sb-nav-link-icon {
            margin-right: 10px;
            width: 20px;
            text-align: center;
        }
        .sb-sidenav-collapse-arrow {
            margin-left: auto;
            transition: transform 0.3s;
        }
        .nav-link[aria-expanded="true"] .sb-sidenav-collapse-arrow {
            transform: rotate(-180deg);
        }
        .sb-sidenav-menu-nested {
            background: #34495e;
            padding: 10px 0;
        }
        .sb-sidenav-menu-nested .nav-link {
            padding: 10px 40px;
            font-size: 0.95em;
        }
        .sb-sidenav-footer {
            position: absolute;
            bottom: 0;
            width: 100%;
            padding: 15px 20px;
            background: #233342;
            font-size: 0.9em;
        }
        .small {
            color: #bdc3c7;
        }
        .collapse {
            display: none;
        }
        .collapse.show {
            display: block;
        }
    </style>
</head>
<body>
    <div id="layoutSidenav_nav">
        <nav class="sb-sidenav accordion sb-sidenav-dark" id="sidenavAccordion">
            <div class="sb-sidenav-menu">
                <div class="nav">
                    <div class="sb-sidenav-menu-heading">Основное</div>
                    <a class="nav-link" href="dashboard.php">
                        <div class="sb-nav-link-icon"><i class="fas fa-tachometer-alt"></i></div>
                        Панель управления
                    </a>
                    <a class="nav-link collapsed" href="#" data-toggle="collapse" data-target="#collapseLayouts" aria-expanded="false" aria-controls="collapseLayouts">
                        <div class="sb-nav-link-icon"><i class="fas fa-columns"></i></div>
                        Разделы дневника
                        <div class="sb-sidenav-collapse-arrow"><i class="fas fa-angle-down"></i></div>
                    </a>
                    <div class="collapse" id="collapseLayouts" aria-labelledby="headingOne" data-parent="#sidenavAccordion">
                        <nav class="sb-sidenav-menu-nested nav">
                            <a class="nav-link" href="add-category.php">Добавить</a>
                            <a class="nav-link" href="manage-categories.php">Управление</a>
                        </nav>
                    </div>
                    <a class="nav-link collapsed" href="#" data-toggle="collapse" data-target="#collapsePages" aria-expanded="false" aria-controls="collapsePages">
                        <div class="sb-nav-link-icon"><i class="fas fa-book-open"></i></div>
                        Записи
                        <div class="sb-sidenav-collapse-arrow"><i class="fas fa-angle-down"></i></div>
                    </a>
                    <div class="collapse" id="collapsePages" aria-labelledby="headingOne" data-parent="#sidenavAccordion">
                        <nav class="sb-sidenav-menu-nested nav">
                            <a class="nav-link" href="add-notes.php">Добавить</a>
                            <a class="nav-link" href="manage-notes.php">Управление</a>
                        </nav>
                    </div>
                    <div class="sb-sidenav-menu-heading">Настройки профиля</div>
                    <a class="nav-link" href="change-password.php">
                        <div class="sb-nav-link-icon"><i class="fa fa-cog"></i></div>
                        Сменить пароль
                    </a>
                    <a class="nav-link" href="my-profile.php">
                        <div class="sb-nav-link-icon"><i class="fa fa-user"></i></div>
                        Мой профиль
                    </a>
                    <a class="nav-link" href="logout.php">
                        <div class="sb-nav-link-icon"><i class="fa fa-sign-out-alt"></i></div>
                        Выйти
                    </a>
                </div>
            </div>
            <div class="sb-sidenav-footer">
                <div class="small">Вы вошли как:</div>
                Иван Иванов
            </div>
        </nav>
    </div>

    <script>
        document.querySelectorAll('.nav-link[data-toggle="collapse"]').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('data-target'));
                const isExpanded = this.getAttribute('aria-expanded') === 'true';
                
                // Закрываем все открытые collapse
                document.querySelectorAll('.collapse.show').forEach(collapse => {
                    if (collapse !== target) collapse.classList.remove('show');
                });
                document.querySelectorAll('.nav-link[aria-expanded="true"]').forEach(expandedLink => {
                    if (expandedLink !== this) expandedLink.setAttribute('aria-expanded', 'false');
                });

                // Переключаем текущий collapse
                target.classList.toggle('show');
                this.setAttribute('aria-expanded', !isExpanded);
            });
        });
    </script>
</body>
</html>