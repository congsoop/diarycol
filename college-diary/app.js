const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const querystring = require('querystring');

let users = [];
try {
    users = JSON.parse(fs.readFileSync(path.join(__dirname, 'users.json'), 'utf8'));
    console.log('Users loaded:', users);
} catch (err) {
    console.error('Error loading users.json:', err);
    users = [];
}

let notifications = [];
try {
    notifications = JSON.parse(fs.readFileSync(path.join(__dirname, 'notifications.json'), 'utf8'));
    console.log('Notifications loaded:', notifications);
} catch (err) {
    console.error('Error loading notifications.json:', err);
    notifications = [];
}

const loadGrades = () => {
    try {
        return JSON.parse(fs.readFileSync(path.join(__dirname, 'grades.json'), 'utf8'));
    } catch (err) {
        return [];
    }
};

const saveGrades = (grades) => {
    fs.writeFileSync(path.join(__dirname, 'grades.json'), JSON.stringify(grades, null, 2));
};

const loadSchedule = () => {
    try {
        return JSON.parse(fs.readFileSync(path.join(__dirname, 'schedule.json'), 'utf8'));
    } catch (err) {
        return [];
    }
};

const saveSchedule = (schedule) => {
    fs.writeFileSync(path.join(__dirname, 'schedule.json'), JSON.stringify(schedule, null, 2));
};

const saveNotifications = (notifications) => {
    fs.writeFileSync(path.join(__dirname, 'notifications.json'), JSON.stringify(notifications, null, 2));
};

const addNotification = (userId, message) => {
    notifications.push({
        id: notifications.length + 1,
        userId,
        message,
        timestamp: new Date().toISOString(),
        read: false
    });
    saveNotifications(notifications);
};

const renderTemplate = (html, user) => {
    const fullName = user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username;
    html = html.replace(/<!-- FULLNAME -->/g, fullName);
    if (user.role === 'teacher') {
        html = html.replace(/<!-- IF_TEACHER -->/g, '').replace(/<!-- END_IF_TEACHER -->/g, '');
    } else {
        html = html.replace(/<!-- IF_TEACHER -->[\s\S]*?<!-- END_IF_TEACHER -->/g, '');
    }
    // Добавляем уведомления в шапку
    const userNotifications = notifications.filter(n => n.userId === user.id && !n.read);
    let notificationHtml = '';
    if (userNotifications.length > 0) {
        notificationHtml = `
            <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" id="notificationsDropdown" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="fas fa-bell fa-fw"></i>
                    <span class="badge bg-danger">${userNotifications.length}</span>
                </a>
                <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="notificationsDropdown">
                    ${userNotifications.map(n => `
                        <li><a class="dropdown-item" href="/mark-notification-read?id=${n.id}">${n.message} (${new Date(n.timestamp).toLocaleString('ru-RU')})</a></li>
                    `).join('')}
                </ul>
            </li>
        `;
    }
    html = html.replace('<!-- NOTIFICATIONS -->', notificationHtml);
    return html;
};

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;

    const cookies = req.headers.cookie ? querystring.parse(req.headers.cookie, '; ') : {};
    const user = cookies.edmsid ? users.find(u => u.id === parseInt(cookies.edmsid)) : null;

    console.log(`Request: ${req.method} ${pathname}`);

    if (pathname === '/login' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        fs.createReadStream(path.join(__dirname, 'views', 'login.html')).pipe(res);
    } else if (pathname === '/login' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const { username, password } = querystring.parse(body);
            console.log(`Login attempt: ${username}, ${password}`);
            const user = users.find(u => u.username === username && u.password === password);
            if (user) {
                res.writeHead(302, {
                    'Set-Cookie': `edmsid=${user.id}; Path=/`,
                    'Location': '/dashboard'
                });
                res.end();
            } else {
                let html = fs.readFileSync(path.join(__dirname, 'views', 'login.html'), 'utf8');
                html = html.replace('<!-- ERROR -->', '<p class="text-danger">Неверный логин или пароль</p>');
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(html);
            }
        });
    } else if (pathname === '/register' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const { firstName, lastName, username, password, role } = querystring.parse(body);
            console.log(`Register attempt: ${username}, ${role}`);
            if (users.find(u => u.username === username)) {
                let html = fs.readFileSync(path.join(__dirname, 'views', 'login.html'), 'utf8');
                html = html.replace('<!-- REG_ERROR -->', '<p class="text-danger">Пользователь с таким логином уже существует</p>');
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(html);
            } else {
                const newUser = {
                    id: users.length + 1,
                    firstName,
                    lastName,
                    username,
                    password,
                    role
                };
                users.push(newUser);
                fs.writeFileSync(path.join(__dirname, 'users.json'), JSON.stringify(users, null, 2));
                res.writeHead(302, {
                    'Set-Cookie': `edmsid=${newUser.id}; Path=/`,
                    'Location': '/dashboard'
                });
                res.end();
            }
        });
    } else if (pathname === '/dashboard') {
        if (!user) {
            res.writeHead(302, { 'Location': '/login' });
            res.end();
            return;
        }
        let html = fs.readFileSync(path.join(__dirname, 'views', 'dashboard.html'), 'utf8');
        html = renderTemplate(html, user);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
    } else if (pathname === '/change-password' && req.method === 'GET') {
        if (!user) {
            res.writeHead(302, { 'Location': '/login' });
            res.end();
            return;
        }
        let html = fs.readFileSync(path.join(__dirname, 'views', 'change-password.html'), 'utf8');
        html = renderTemplate(html, user);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
    } else if (pathname === '/change-password' && req.method === 'POST') {
        if (!user) {
            res.writeHead(302, { 'Location': '/login' });
            res.end();
            return;
        }
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const { newPassword } = querystring.parse(body);
            user.password = newPassword;
            fs.writeFileSync(path.join(__dirname, 'users.json'), JSON.stringify(users, null, 2));
            res.writeHead(302, { 'Location': '/dashboard' });
            res.end();
        });
    } else if (pathname === '/profile') {
        if (!user) {
            res.writeHead(302, { 'Location': '/login' });
            res.end();
            return;
        }
        let html = fs.readFileSync(path.join(__dirname, 'views', 'profile.html'), 'utf8');
        html = renderTemplate(html, user);
        html = html.replace('<!-- USERNAME -->', user.username);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
    } else if (pathname === '/add-grades' && req.method === 'GET') {
        if (!user || user.role !== 'teacher') {
            res.writeHead(403, { 'Content-Type': 'text/html' });
            res.end('<h1>Доступ запрещен</h1><p>Только учителя могут добавлять оценки</p>');
            return;
        }
        let html = fs.readFileSync(path.join(__dirname, 'views', 'add-grades.html'), 'utf8');
        let studentOptions = users
            .filter(u => u.role === 'student')
            .map(u => `<option value="${u.username}">${u.firstName} ${u.lastName}</option>`)
            .join('');
        html = html.replace('<!-- STUDENT_OPTIONS -->', studentOptions);
        html = renderTemplate(html, user);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
    } else if (pathname === '/add-grades' && req.method === 'POST') {
        if (!user || user.role !== 'teacher') {
            res.writeHead(403, { 'Content-Type': 'text/html' });
            res.end('<h1>Доступ запрещен</h1><p>Только учителя могут добавлять оценки</p>');
            return;
        }
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const { student, subject, grade } = querystring.parse(body);
            const grades = loadGrades();
            grades.push({ id: grades.length + 1, student, subject, grade, addedBy: user.id });
            saveGrades(grades);
            // Уведомление для студента
            const studentUser = users.find(u => u.username === student);
            if (studentUser) {
                addNotification(studentUser.id, `Вам поставили оценку ${grade} по предмету ${subject}`);
            }
            res.writeHead(302, { 'Location': '/manage-grades' });
            res.end();
        });
    } else if (pathname === '/edit-grade' && req.method === 'GET') {
        if (!user || user.role !== 'teacher') {
            res.writeHead(403, { 'Content-Type': 'text/html' });
            res.end('<h1>Доступ запрещен</h1><p>Только учителя могут редактировать оценки</p>');
            return;
        }
        const gradeId = parseInt(query.id);
        const grades = loadGrades();
        const grade = grades.find(g => g.id === gradeId);
        if (!grade) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>Оценка не найдена</h1>');
            return;
        }
        let html = fs.readFileSync(path.join(__dirname, 'views', 'edit-grade.html'), 'utf8');
        let studentOptions = users
            .filter(u => u.role === 'student')
            .map(u => `<option value="${u.username}" ${u.username === grade.student ? 'selected' : ''}>${u.firstName} ${u.lastName}</option>`)
            .join('');
        html = html.replace('<!-- STUDENT_OPTIONS -->', studentOptions);
        html = html.replace('<!-- SUBJECT -->', grade.subject);
        html = html.replace('<!-- GRADE -->', grade.grade);
        html = html.replace('<!-- GRADE_ID -->', grade.id);
        html = renderTemplate(html, user);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
    } else if (pathname === '/edit-grade' && req.method === 'POST') {
        if (!user || user.role !== 'teacher') {
            res.writeHead(403, { 'Content-Type': 'text/html' });
            res.end('<h1>Доступ запрещен</h1><p>Только учителя могут редактировать оценки</p>');
            return;
        }
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const { id, student, subject, grade } = querystring.parse(body);
            let grades = loadGrades();
            const gradeIndex = grades.findIndex(g => g.id === parseInt(id));
            if (gradeIndex !== -1) {
                const oldGrade = grades[gradeIndex];
                grades[gradeIndex] = { id: parseInt(id), student, subject, grade, addedBy: user.id };
                saveGrades(grades);
                // Уведомление для студента
                const studentUser = users.find(u => u.username === student);
                if (studentUser) {
                    addNotification(studentUser.id, `Ваша оценка по предмету ${subject} изменена с ${oldGrade.grade} на ${grade}`);
                }
            }
            res.writeHead(302, { 'Location': '/manage-grades' });
            res.end();
        });
    } else if (pathname === '/manage-grades') {
        if (!user) {
            res.writeHead(302, { 'Location': '/login' });
            res.end();
            return;
        }
        let html = fs.readFileSync(path.join(__dirname, 'views', 'manage-grades.html'), 'utf8');
        const grades = loadGrades();
        let tableRows = '';
        if (user.role === 'teacher') {
            grades.forEach(g => {
                const student = users.find(u => u.username === g.student);
                const studentName = student ? `${student.firstName} ${student.lastName}` : g.student;
                tableRows += `<tr><td>${studentName}</td><td>${g.subject}</td><td>${g.grade}</td><td><a href="/edit-grade?id=${g.id}" class="btn btn-warning btn-sm">Редактировать</a> <a href="/delete-grade?id=${g.id}" class="btn btn-danger btn-sm">Удалить</a></td></tr>`;
            });
        } else {
            grades.filter(g => g.student === user.username).forEach(g => {
                const student = users.find(u => u.username === g.student);
                const studentName = student ? `${student.firstName} ${student.lastName}` : g.student;
                tableRows += `<tr><td>${studentName}</td><td>${g.subject}</td><td>${g.grade}</td></tr>`;
            });
        }
        html = renderTemplate(html, user);
        html = html.replace('<!-- GRADES -->', tableRows);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
    } else if (pathname === '/delete-grade' && req.method === 'GET') {
        if (!user || user.role !== 'teacher') {
            res.writeHead(403, { 'Content-Type': 'text/html' });
            res.end('<h1>Доступ запрещен</h1><p>Только учителя могут удалять оценки</p>');
            return;
        }
        const gradeId = parseInt(query.id);
        let grades = loadGrades();
        const grade = grades.find(g => g.id === gradeId);
        if (grade) {
            const studentUser = users.find(u => u.username === grade.student);
            if (studentUser) {
                addNotification(studentUser.id, `Ваша оценка ${grade.grade} по предмету ${grade.subject} была удалена`);
            }
        }
        grades = grades.filter(g => g.id !== gradeId);
        saveGrades(grades);
        res.writeHead(302, { 'Location': '/manage-grades' });
        res.end();
    } else if (pathname === '/add-schedule' && req.method === 'GET') {
        if (!user || user.role !== 'teacher') {
            res.writeHead(403, { 'Content-Type': 'text/html' });
            res.end('<h1>Доступ запрещен</h1><p>Только учителя могут добавлять расписание</p>');
            return;
        }
        let html = fs.readFileSync(path.join(__dirname, 'views', 'add-schedule.html'), 'utf8');
        html = renderTemplate(html, user);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
    } else if (pathname === '/add-schedule' && req.method === 'POST') {
        if (!user || user.role !== 'teacher') {
            res.writeHead(403, { 'Content-Type': 'text/html' });
            res.end('<h1>Доступ запрещен</h1><p>Только учителя могут добавлять расписание</p>');
            return;
        }
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const { day, time, subject } = querystring.parse(body);
            if (!day || !time || !subject) {
                res.writeHead(400, { 'Content-Type': 'text/html' });
                res.end('<h1>Ошибка: Все поля обязательны</h1>');
                return;
            }
            const schedule = loadSchedule();
            schedule.push({ id: schedule.length + 1, day, time, subject, addedBy: user.id });
            saveSchedule(schedule);
            // Уведомление для всех студентов
            users.filter(u => u.role === 'student').forEach(student => {
                addNotification(student.id, `Расписание обновлено: ${subject} в ${day} с ${time}`);
            });
            res.writeHead(302, { 'Location': '/manage-schedule' });
            res.end();
        });
    } else if (pathname === '/edit-schedule' && req.method === 'GET') {
        if (!user || user.role !== 'teacher') {
            res.writeHead(403, { 'Content-Type': 'text/html' });
            res.end('<h1>Доступ запрещен</h1><p>Только учителя могут редактировать расписание</p>');
            return;
        }
        const scheduleId = parseInt(query.id);
        const schedule = loadSchedule();
        const entry = schedule.find(s => s.id === scheduleId);
        if (!entry) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>Запись не найдена</h1>');
            return;
        }
        let html = fs.readFileSync(path.join(__dirname, 'views', 'edit-schedule.html'), 'utf8');
        html = html.replace('<!-- DAY -->', entry.day);
        html = html.replace('<!-- TIME -->', entry.time);
        html = html.replace('<!-- SUBJECT -->', entry.subject);
        html = html.replace('<!-- SCHEDULE_ID -->', entry.id);
        html = renderTemplate(html, user);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
    } else if (pathname === '/edit-schedule' && req.method === 'POST') {
        if (!user || user.role !== 'teacher') {
            res.writeHead(403, { 'Content-Type': 'text/html' });
            res.end('<h1>Доступ запрещен</h1><p>Только учителя могут редактировать расписание</p>');
            return;
        }
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const { id, day, time, subject } = querystring.parse(body);
            if (!id || !day || !time || !subject) {
                res.writeHead(400, { 'Content-Type': 'text/html' });
                res.end('<h1>Ошибка: Все поля обязательны</h1>');
                return;
            }
            let schedule = loadSchedule();
            const scheduleIndex = schedule.findIndex(s => s.id === parseInt(id));
            if (scheduleIndex !== -1) {
                const oldEntry = schedule[scheduleIndex];
                schedule[scheduleIndex] = { id: parseInt(id), day, time, subject, addedBy: user.id };
                saveSchedule(schedule);
                // Уведомление для всех студентов
                users.filter(u => u.role === 'student').forEach(student => {
                    addNotification(student.id, `Расписание изменено: ${oldEntry.subject} в ${oldEntry.day} с ${oldEntry.time} на ${subject} в ${day} с ${time}`);
                });
            }
            res.writeHead(302, { 'Location': '/manage-schedule' });
            res.end();
        });
    } else if (pathname === '/manage-schedule') {
        if (!user) {
            res.writeHead(302, { 'Location': '/login' });
            res.end();
            return;
        }
        let html = fs.readFileSync(path.join(__dirname, 'views', 'manage-schedule.html'), 'utf8');
        const schedule = loadSchedule();
        const timeSlots = ["08:00-09:30", "09:40-11:10", "11:20-12:50", "13:00-14:30", "14:40-16:10", "16:20-17:50"];
        const days = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"];
        let tableRows = '';
        timeSlots.forEach(time => {
            tableRows += '<tr>';
            tableRows += `<td>${time}</td>`;
            days.forEach(day => {
                const entry = schedule.find(s => s.day === day && s.time === time);
                if (entry && user.role === 'teacher') {
                    tableRows += `<td>${entry.subject} <br><a href="/edit-schedule?id=${entry.id}" class="btn btn-warning btn-sm mt-1">Редактировать</a> <a href="/delete-schedule?id=${entry.id}" class="btn btn-danger btn-sm mt-1">Удалить</a></td>`;
                } else {
                    tableRows += `<td>${entry ? entry.subject : ''}</td>`;
                }
            });
            tableRows += '</tr>';
        });
        html = renderTemplate(html, user);
        html = html.replace('<!-- SCHEDULE_TABLE -->', tableRows);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
    } else if (pathname === '/delete-schedule' && req.method === 'GET') {
        if (!user || user.role !== 'teacher') {
            res.writeHead(403, { 'Content-Type': 'text/html' });
            res.end('<h1>Доступ запрещен</h1><p>Только учителя могут удалять расписание</p>');
            return;
        }
        const scheduleId = parseInt(query.id);
        let schedule = loadSchedule();
        const entry = schedule.find(s => s.id === scheduleId);
        if (entry) {
            users.filter(u => u.role === 'student').forEach(student => {
                addNotification(student.id, `Запись в расписании удалена: ${entry.subject} в ${entry.day} с ${entry.time}`);
            });
        }
        schedule = schedule.filter(s => s.id !== scheduleId);
        saveSchedule(schedule);
        res.writeHead(302, { 'Location': '/manage-schedule' });
        res.end();
    } else if (pathname === '/mark-notification-read' && req.method === 'GET') {
        if (!user) {
            res.writeHead(302, { 'Location': '/login' });
            res.end();
            return;
        }
        const notificationId = parseInt(query.id);
        const notification = notifications.find(n => n.id === notificationId && n.userId === user.id);
        if (notification) {
            notification.read = true;
            saveNotifications(notifications);
        }
        res.writeHead(302, { 'Location': req.headers.referer || '/dashboard' });
        res.end();
    } else if (pathname.startsWith('/css/')) {
        res.writeHead(200, { 'Content-Type': 'text/css' });
        fs.createReadStream(path.join(__dirname, 'public', pathname)).pipe(res);
    } else if (pathname === '/logout') {
        res.writeHead(302, {
            'Set-Cookie': 'edmsid=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
            'Location': '/login'
        });
        res.end();
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});