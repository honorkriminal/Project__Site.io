// Инициализация страницы транзакций
document.addEventListener('DOMContentLoaded', function() {
    // Установка обработчиков для страницы транзакций
    setupTransactionsHandlers();
});

// Настройка обработчиков для страницы транзакций
function setupTransactionsHandlers() {
    // Заполнение списка категорий фильтра
    const filterCategorySelect = document.getElementById('filter-category');
    if (filterCategorySelect) {
        // Очистка и добавление категорий доходов
        window.app.categories.income.forEach(category => {
            const option = document.createElement('option');
            option.value = 'income_' + category.id;
            option.textContent = 'Доход: ' + category.name;
            filterCategorySelect.appendChild(option);
        });
        
        // Добавление категорий расходов
        window.app.categories.expense.forEach(category => {
            const option = document.createElement('option');
            option.value = 'expense_' + category.id;
            option.textContent = 'Расход: ' + category.name;
            filterCategorySelect.appendChild(option);
        });
    }
    
    // Установка текущей даты для фильтров по умолчанию
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const filterDateFrom = document.getElementById('filter-date-from');
    const filterDateTo = document.getElementById('filter-date-to');
    
    if (filterDateFrom && filterDateTo) {
        filterDateFrom.valueAsDate = firstDayOfMonth;
        filterDateTo.valueAsDate = today;
    }
    
    // Обработчик применения фильтров
    const applyFiltersBtn = document.getElementById('apply-filters');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', function() {
            updateTransactions();
        });
    }
}

// Обновление списка транзакций
function updateTransactions() {
    const tableBody = document.getElementById('transactions-body');
    if (!tableBody) return;
    
    // Очистка текущего содержимого таблицы
    tableBody.innerHTML = '';
    
    // Получение значений фильтров
    const dateFrom = document.getElementById('filter-date-from').value;
    const dateTo = document.getElementById('filter-date-to').value;
    const typeFilter = document.getElementById('filter-type').value;
    const categoryFilter = document.getElementById('filter-category').value;
    
    // Применение фильтров
    let filteredTransactions = window.app.transactions.filter(transaction => {
        // Фильтр по дате
        if (dateFrom && transaction.date < dateFrom) return false;
        if (dateTo && transaction.date > dateTo) return false;
        
        // Фильтр по типу
        if (typeFilter !== 'all' && transaction.type !== typeFilter) return false;
        
        // Фильтр по категории
        if (categoryFilter !== 'all') {
            const [filterType, filterCategory] = categoryFilter.split('_');
            if (transaction.type !== filterType || transaction.category !== filterCategory) return false;
        }
        
        return true;
    });
    
    // Сортировка транзакций по дате (сначала новые)
    filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Проверка на наличие данных
    if (filteredTransactions.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="6" class="text-center">Нет транзакций, соответствующих фильтрам</td>
        `;
        tableBody.appendChild(row);
        return;
    }
    
    // Заполнение таблицы данными
    filteredTransactions.forEach(transaction => {
        const row = document.createElement('tr');
        row.dataset.id = transaction.id;
        
        // Форматирование даты
        const date = new Date(transaction.date);
        const formattedDate = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
        
        // Получение названия категории
        const categoryList = transaction.type === 'income' ? window.app.categories.income : window.app.categories.expense;
        const category = categoryList.find(c => c.id === transaction.category);
        const categoryName = category ? category.name : transaction.category;
        
        // Форматирование суммы
        const amountClass = transaction.type === 'income' ? 'income' : 'expense';
        const amountPrefix = transaction.type === 'income' ? '+' : '-';
        const typeText = transaction.type === 'income' ? 'Доход' : 'Расход';
        
        row.innerHTML = `
            <td>${formattedDate}</td>
            <td>${typeText}</td>
            <td>${categoryName}</td>
            <td>${transaction.description}</td>
            <td class="${amountClass}">${amountPrefix}${formatCurrency(transaction.amount)}</td>
            <td>
                <button class="btn btn-sm edit-transaction" data-id="${transaction.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger delete-transaction" data-id="${transaction.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Добавление обработчиков для кнопок редактирования и удаления
    setupTransactionButtons();
}

// Настройка кнопок управления транзакциями
function setupTransactionButtons() {
    // Обработчики для кнопок удаления
    document.querySelectorAll('.delete-transaction').forEach(btn => {
        btn.addEventListener('click', function() {
            const transactionId = this.getAttribute('data-id');
            
            if (confirm('Вы уверены, что хотите удалить эту транзакцию?')) {
                deleteTransaction(transactionId);
            }
        });
    });
    
    // Обработчики для кнопок редактирования
    document.querySelectorAll('.edit-transaction').forEach(btn => {
        btn.addEventListener('click', function() {
            const transactionId = this.getAttribute('data-id');
            editTransaction(transactionId);
        });
    });
}

// Удаление транзакции
function deleteTransaction(transactionId) {
    // Находим индекс транзакции
    const index = window.app.transactions.findIndex(t => t.id === transactionId);
    
    if (index !== -1) {
        // Удаляем транзакцию
        window.app.transactions.splice(index, 1);
        
        // Сохраняем данные
        saveAppData();
        
        // Обновляем интерфейс
        updateTransactions();
        updateDashboard();
    }
}

// Редактирование транзакции
function editTransaction(transactionId) {
    // Находим транзакцию
    const transaction = window.app.transactions.find(t => t.id === transactionId);
    
    if (!transaction) return;
    
    // Открываем соответствующее модальное окно
    if (transaction.type === 'income') {
        openModal('add-income-modal');
        
        // Заполняем форму данными
        document.getElementById('income-amount').value = transaction.amount;
        document.getElementById('income-date').value = transaction.date;
        document.getElementById('income-category').value = transaction.category;
        document.getElementById('income-description').value = transaction.description;
        
        // Сохраняем ID редактируемой транзакции
        document.getElementById('add-income-form').dataset.editId = transactionId;
        
        // Изменяем обработчик формы для режима редактирования
        const form = document.getElementById('add-income-form');
        const originalSubmitHandler = form.onsubmit;
        
        form.onsubmit = function(e) {
            e.preventDefault();
            
            const editId = this.dataset.editId;
            const amount = parseFloat(document.getElementById('income-amount').value);
            const date = document.getElementById('income-date').value;
            const category = document.getElementById('income-category').value;
            const description = document.getElementById('income-description').value || 'Доход';
            
            // Обновляем транзакцию
            const index = window.app.transactions.findIndex(t => t.id === editId);
            if (index !== -1) {
                window.app.transactions[index].amount = amount;
                window.app.transactions[index].date = date;
                window.app.transactions[index].category = category;
                window.app.transactions[index].description = description;
            }
            
            // Сохраняем данные
            saveAppData();
            
            // Закрываем модальное окно
            closeAllModals();
            
            // Сбрасываем форму
            this.reset();
            delete this.dataset.editId;
            
            // Восстанавливаем оригинальный обработчик
            this.onsubmit = originalSubmitHandler;
            
            // Обновляем интерфейс
            updateTransactions();
            updateDashboard();
        };
    } else {
        openModal('add-expense-modal');
        
        // Заполняем форму данными
        document.getElementById('expense-amount').value = transaction.amount;
        document.getElementById('expense-date').value = transaction.date;
        document.getElementById('expense-category').value = transaction.category;
        document.getElementById('expense-description').value = transaction.description;
        
        // Сохраняем ID редактируемой транзакции
        document.getElementById('add-expense-form').dataset.editId = transactionId;
        
        // Изменяем обработчик формы для режима редактирования
        const form = document.getElementById('add-expense-form');
        const originalSubmitHandler = form.onsubmit;
        
        form.onsubmit = function(e) {
            e.preventDefault();
            
            const editId = this.dataset.editId;
            const amount = parseFloat(document.getElementById('expense-amount').value);
            const date = document.getElementById('expense-date').value;
            const category = document.getElementById('expense-category').value;
            const description = document.getElementById('expense-description').value || 'Расход';
            
            // Обновляем транзакцию
            const index = window.app.transactions.findIndex(t => t.id === editId);
            if (index !== -1) {
                window.app.transactions[index].amount = amount;
                window.app.transactions[index].date = date;
                window.app.transactions[index].category = category;
                window.app.transactions[index].description = description;
            }
            
            // Сохраняем данные
            saveAppData();
            
            // Закрываем модальное окно
            closeAllModals();
            
            // Сбрасываем форму
            this.reset();
            delete this.dataset.editId;
            
            // Восстанавливаем оригинальный обработчик
            this.onsubmit = originalSubmitHandler;
            
            // Обновляем интерфейс
            updateTransactions();
            updateDashboard();
        };
    }
} 