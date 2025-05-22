// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    // Глобальные переменные
    window.app = {
        currentUser: null,
        transactions: [],
        budgets: {},
        categories: {
            income: [
                { id: 'salary', name: 'Зарплата' },
                { id: 'freelance', name: 'Фриланс' },
                { id: 'investment', name: 'Инвестиции' },
                { id: 'gift', name: 'Подарки' },
                { id: 'other', name: 'Другое' }
            ],
            expense: [
                { id: 'food', name: 'Питание' },
                { id: 'transport', name: 'Транспорт' },
                { id: 'housing', name: 'Жилье' },
                { id: 'entertainment', name: 'Развлечения' },
                { id: 'health', name: 'Здоровье' },
                { id: 'education', name: 'Образование' },
                { id: 'clothes', name: 'Одежда' },
                { id: 'other', name: 'Другое' }
            ]
        }
    };

    // Инициализация из localStorage
    loadAppData();

    // Настройка навигации
    setupNavigation();

    // Настройка обработчиков модальных окон
    setupModals();

    // Проверка авторизации
    checkAuth();
});

// Загрузка данных приложения из localStorage
function loadAppData() {
    // Загрузка пользователя
    const savedUser = localStorage.getItem('finplan_user');
    if (savedUser) {
        window.app.currentUser = JSON.parse(savedUser);
    }

    // Загрузка транзакций
    const savedTransactions = localStorage.getItem('finplan_transactions');
    if (savedTransactions) {
        window.app.transactions = JSON.parse(savedTransactions);
    }

    // Загрузка бюджетов
    const savedBudgets = localStorage.getItem('finplan_budgets');
    if (savedBudgets) {
        window.app.budgets = JSON.parse(savedBudgets);
    }
}

// Сохранение данных приложения в localStorage
function saveAppData() {
    // Сохранение пользователя
    if (window.app.currentUser) {
        localStorage.setItem('finplan_user', JSON.stringify(window.app.currentUser));
    } else {
        localStorage.removeItem('finplan_user');
    }

    // Сохранение транзакций
    localStorage.setItem('finplan_transactions', JSON.stringify(window.app.transactions));

    // Сохранение бюджетов
    localStorage.setItem('finplan_budgets', JSON.stringify(window.app.budgets));
}

// Настройка навигации
function setupNavigation() {
    const navLinks = document.querySelectorAll('.main-nav a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Получаем ID страницы для отображения
            const pageId = this.getAttribute('data-page');
            
            // Удаляем класс 'active' у всех ссылок
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            
            // Добавляем класс 'active' к текущей ссылке
            this.classList.add('active');
            
            // Скрываем все страницы
            document.querySelectorAll('.page').forEach(page => {
                page.classList.add('hidden');
            });
            
            // Показываем выбранную страницу
            document.getElementById(pageId).classList.remove('hidden');
        });
    });

    // Обработка ссылок "смотреть все транзакции"
    document.querySelectorAll('.view-all').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const pageId = this.getAttribute('data-page');
            
            // Активируем соответствующую ссылку в навигации
            document.querySelector(`.main-nav a[data-page="${pageId}"]`).click();
        });
    });
}

// Настройка модальных окон
function setupModals() {
    // Закрытие модальных окон
    document.querySelectorAll('.close-modal').forEach(closeBtn => {
        closeBtn.addEventListener('click', closeAllModals);
    });

    // Закрытие модальных окон при клике вне модального окна
    document.getElementById('modal-overlay').addEventListener('click', function(e) {
        if (e.target === this) {
            closeAllModals();
        }
    });

    // Кнопки добавления дохода
    document.querySelectorAll('#add-income-btn, #transactions-add-income').forEach(btn => {
        btn.addEventListener('click', function() {
            openModal('add-income-modal');
            
            // Установка текущей даты
            document.getElementById('income-date').valueAsDate = new Date();
        });
    });

    // Кнопки добавления расхода
    document.querySelectorAll('#add-expense-btn, #transactions-add-expense').forEach(btn => {
        btn.addEventListener('click', function() {
            openModal('add-expense-modal');
            
            // Установка текущей даты
            document.getElementById('expense-date').valueAsDate = new Date();
        });
    });

    // Обработка формы добавления дохода
    document.getElementById('add-income-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const amount = parseFloat(document.getElementById('income-amount').value);
        const date = document.getElementById('income-date').value;
        const category = document.getElementById('income-category').value;
        const description = document.getElementById('income-description').value || 'Доход';
        
        // Создание новой транзакции
        const transaction = {
            id: generateId(),
            type: 'income',
            amount: amount,
            date: date,
            category: category,
            description: description,
            createdAt: new Date().toISOString()
        };
        
        // Добавление транзакции
        window.app.transactions.push(transaction);
        
        // Сохранение данных
        saveAppData();
        
        // Закрытие модального окна
        closeAllModals();
        
        // Сброс формы
        this.reset();
        
        // Обновление интерфейса
        updateDashboard();
        updateTransactions();
    });

    // Обработка формы добавления расхода
    document.getElementById('add-expense-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const amount = parseFloat(document.getElementById('expense-amount').value);
        const date = document.getElementById('expense-date').value;
        const category = document.getElementById('expense-category').value;
        const description = document.getElementById('expense-description').value || 'Расход';
        
        // Создание новой транзакции
        const transaction = {
            id: generateId(),
            type: 'expense',
            amount: amount,
            date: date,
            category: category,
            description: description,
            createdAt: new Date().toISOString()
        };
        
        // Добавление транзакции
        window.app.transactions.push(transaction);
        
        // Сохранение данных
        saveAppData();
        
        // Закрытие модального окна
        closeAllModals();
        
        // Сброс формы
        this.reset();
        
        // Обновление интерфейса
        updateDashboard();
        updateTransactions();
    });

    // Кнопка просмотра бюджета
    document.getElementById('view-budget-btn').addEventListener('click', function() {
        // Активируем ссылку бюджета в навигации
        document.querySelector('.main-nav a[data-page="budget"]').click();
    });

    // Добавление категории бюджета
    document.getElementById('add-budget-category').addEventListener('click', function() {
        openModal('edit-budget-category-modal');
        
        // Заполнение списка категорий
        const budgetCategorySelect = document.getElementById('budget-category-name');
        budgetCategorySelect.innerHTML = '';
        
        window.app.categories.expense.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            budgetCategorySelect.appendChild(option);
        });
        
        // Сброс формы
        document.getElementById('edit-budget-category-form').reset();
        document.getElementById('budget-category-id').value = '';
    });

    // Обработка формы редактирования категории бюджета
    document.getElementById('edit-budget-category-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const categoryId = document.getElementById('budget-category-id').value;
        const categoryName = document.getElementById('budget-category-name').value;
        const amount = parseFloat(document.getElementById('budget-category-amount').value);
        
        // Получение текущего месяца
        const currentMonth = document.getElementById('budget-month').value || getCurrentMonth();
        
        // Инициализация бюджета для текущего месяца, если не существует
        if (!window.app.budgets[currentMonth]) {
            window.app.budgets[currentMonth] = {
                categories: []
            };
        }
        
        if (categoryId) {
            // Обновление существующей категории
            const index = window.app.budgets[currentMonth].categories.findIndex(cat => cat.id === categoryId);
            if (index !== -1) {
                window.app.budgets[currentMonth].categories[index].amount = amount;
            }
        } else {
            // Добавление новой категории
            window.app.budgets[currentMonth].categories.push({
                id: categoryName,
                amount: amount
            });
        }
        
        // Сохранение данных
        saveAppData();
        
        // Закрытие модального окна
        closeAllModals();
        
        // Обновление интерфейса
        updateBudget();
    });
}

// Открытие модального окна
function openModal(modalId) {
    document.getElementById('modal-overlay').classList.remove('hidden');
    document.getElementById(modalId).classList.remove('hidden');
}

// Закрытие всех модальных окон
function closeAllModals() {
    document.getElementById('modal-overlay').classList.add('hidden');
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.add('hidden');
    });
}

// Проверка авторизации
function checkAuth() {
    if (window.app.currentUser) {
        // Пользователь авторизован
        showUserProfile();
        showDashboard();
    } else {
        // Пользователь не авторизован
        showAuthForm();
    }
}

// Показать профиль пользователя
function showUserProfile() {
    document.getElementById('login-btn').classList.add('hidden');
    document.getElementById('register-btn').classList.add('hidden');
    document.querySelector('.user-profile').classList.remove('hidden');
    document.getElementById('user-name').textContent = window.app.currentUser.name;
}

// Показать форму авторизации
function showAuthForm() {
    document.getElementById('login-btn').classList.remove('hidden');
    document.getElementById('register-btn').classList.remove('hidden');
    document.querySelector('.user-profile').classList.add('hidden');
    
    document.getElementById('auth-section').classList.remove('hidden');
    document.querySelectorAll('.page').forEach(page => {
        page.classList.add('hidden');
    });
}

// Показать панель управления
function showDashboard() {
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    
    // Обновление данных на панели
    updateDashboard();
    updateTransactions();
    updateBudget();
    updateReports();
}

// Генерация уникального ID
function generateId() {
    return 'id_' + Math.random().toString(36).substr(2, 9);
}

// Получение текущего месяца в формате YYYY-MM
function getCurrentMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// Форматирование суммы в рубли
function formatCurrency(amount) {
    return amount.toFixed(2) + ' ₽';
}

// Обновление панели управления
function updateDashboard() {
    // Эта функция будет реализована в dashboard.js
}

// Обновление списка транзакций
function updateTransactions() {
    // Эта функция будет реализована в transactions.js
}

// Обновление бюджета
function updateBudget() {
    // Эта функция будет реализована в budget.js
}

// Обновление отчетов
function updateReports() {
    // Эта функция будет реализована в reports.js
} 