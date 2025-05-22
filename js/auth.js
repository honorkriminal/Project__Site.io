// Инициализация аутентификации
document.addEventListener('DOMContentLoaded', function() {
    // Настройка обработчиков формы авторизации
    setupAuthHandlers();
});

// Настройка обработчиков формы авторизации
function setupAuthHandlers() {
    // Переключение между формами входа и регистрации
    document.getElementById('show-register').addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector('.login-form').classList.add('hidden');
        document.querySelector('.register-form').classList.remove('hidden');
    });

    document.getElementById('show-login').addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector('.register-form').classList.add('hidden');
        document.querySelector('.login-form').classList.remove('hidden');
    });

    // Кнопки входа и регистрации в хедере
    document.getElementById('login-btn').addEventListener('click', function(e) {
        e.preventDefault();
        showAuthForm();
        document.querySelector('.register-form').classList.add('hidden');
        document.querySelector('.login-form').classList.remove('hidden');
    });

    document.getElementById('register-btn').addEventListener('click', function(e) {
        e.preventDefault();
        showAuthForm();
        document.querySelector('.login-form').classList.add('hidden');
        document.querySelector('.register-form').classList.remove('hidden');
    });

    // Выход из аккаунта
    document.getElementById('logout-btn').addEventListener('click', function(e) {
        e.preventDefault();
        logout();
    });

    // Обработка формы входа
    document.getElementById('login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        login(email, password);
    });

    // Обработка формы регистрации
    document.getElementById('register-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const passwordConfirm = document.getElementById('register-password-confirm').value;
        
        if (password !== passwordConfirm) {
            alert('Пароли не совпадают!');
            return;
        }
        
        register(name, email, password);
    });
}

// Функция входа
function login(email, password) {
    // В реальном приложении здесь был бы запрос к серверу
    // В этой версии мы просто проверяем localStorage
    
    const users = JSON.parse(localStorage.getItem('finplan_users') || '[]');
    const user = users.find(u => u.email === email);
    
    if (!user) {
        alert('Пользователь с таким email не найден');
        return;
    }
    
    if (user.password !== hashPassword(password)) {
        alert('Неверный пароль');
        return;
    }
    
    // Авторизация успешна
    const currentUser = {
        id: user.id,
        name: user.name,
        email: user.email
    };
    
    window.app.currentUser = currentUser;
    saveAppData();
    
    // Обновление интерфейса
    showUserProfile();
    showDashboard();
}

// Функция регистрации
function register(name, email, password) {
    // В реальном приложении здесь был бы запрос к серверу
    // В этой версии мы просто используем localStorage
    
    const users = JSON.parse(localStorage.getItem('finplan_users') || '[]');
    
    // Проверка на уникальность email
    if (users.some(u => u.email === email)) {
        alert('Пользователь с таким email уже существует');
        return;
    }
    
    // Создание нового пользователя
    const newUser = {
        id: generateId(),
        name: name,
        email: email,
        password: hashPassword(password),
        createdAt: new Date().toISOString()
    };
    
    // Добавление пользователя в "базу данных"
    users.push(newUser);
    localStorage.setItem('finplan_users', JSON.stringify(users));
    
    // Авторизация нового пользователя
    const currentUser = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
    };
    
    window.app.currentUser = currentUser;
    saveAppData();
    
    // Инициализация данных пользователя
    initializeUserData();
    
    // Обновление интерфейса
    showUserProfile();
    showDashboard();
}

// Функция выхода
function logout() {
    window.app.currentUser = null;
    saveAppData();
    
    // Обновление интерфейса
    showAuthForm();
}

// Инициализация данных пользователя
function initializeUserData() {
    // Создание некоторых примеров транзакций для нового пользователя
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    // Форматирование дат в формат YYYY-MM-DD
    const formatDate = date => {
        return date.toISOString().split('T')[0];
    };
    
    // Создание примеров транзакций
    window.app.transactions = [
                {            id: generateId(),            type: 'income',            amount: 20000,            date: formatDate(lastWeek),            category: 'salary',            description: 'Зарплата',            createdAt: new Date().toISOString()        },
        {
            id: generateId(),
            type: 'expense',
            amount: 2000,
            date: formatDate(yesterday),
            category: 'food',
            description: 'Продукты в супермаркете',
            createdAt: new Date().toISOString()
        },
        {
            id: generateId(),
            type: 'expense',
            amount: 1500,
            date: formatDate(today),
            category: 'transport',
            description: 'Бензин',
            createdAt: new Date().toISOString()
        }
    ];
    
    // Создание примера бюджета
    const currentMonth = getCurrentMonth();
    window.app.budgets[currentMonth] = {
        categories: [
            { id: 'food', amount: 15000 },
            { id: 'transport', amount: 5000 },
            { id: 'entertainment', amount: 3000 }
        ]
    };
    
    // Сохранение данных
    saveAppData();
}

// Хеширование пароля
// В реальном приложении здесь был бы безопасный метод хеширования
function hashPassword(password) {
    // Это очень простая "хеш-функция", только для демонстрации
    // В реальном приложении нужно использовать более безопасные методы
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(16);
} 