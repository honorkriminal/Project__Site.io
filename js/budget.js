// Инициализация страницы бюджета
document.addEventListener('DOMContentLoaded', function() {
    // Установка обработчиков страницы бюджета
    setupBudgetHandlers();
});

// Настройка обработчиков для страницы бюджета
function setupBudgetHandlers() {
    // Установка текущего месяца по умолчанию
    const budgetMonth = document.getElementById('budget-month');
    if (budgetMonth) {
        budgetMonth.value = getCurrentMonth();
        
        // Обработчик изменения месяца
        budgetMonth.addEventListener('change', function() {
            updateBudget();
        });
    }
    
    // Обработчик кнопки загрузки бюджета
    const loadBudgetBtn = document.getElementById('load-budget');
    if (loadBudgetBtn) {
        loadBudgetBtn.addEventListener('click', function() {
            updateBudget();
        });
    }
}

// Обновление страницы бюджета
function updateBudget() {
    // Получение выбранного месяца
    const selectedMonth = document.getElementById('budget-month').value;
    if (!selectedMonth) return;
    
    // Получение бюджета для выбранного месяца
    const budget = window.app.budgets[selectedMonth] || { categories: [] };
    
    // Расчет фактических доходов и расходов за месяц
    const transactions = window.app.transactions.filter(t => t.date.startsWith(selectedMonth));
    
    const actualIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const actualExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    // Расчет плановых доходов и расходов
    const plannedExpense = budget.categories.reduce((sum, cat) => sum + cat.amount, 0);
    
    // Обновление блоков с данными
    document.getElementById('planned-income').textContent = formatCurrency(0); // В этой версии нет планирования доходов
    document.getElementById('planned-expenses').textContent = formatCurrency(plannedExpense);
    document.getElementById('actual-income').textContent = formatCurrency(actualIncome);
    document.getElementById('actual-expenses').textContent = formatCurrency(actualExpense);
    
    // Заполнение таблицы категорий бюджета
    const budgetTable = document.getElementById('budget-body');
    if (!budgetTable) return;
    
    // Очистка текущего содержимого таблицы
    budgetTable.innerHTML = '';
    
    // Объект для хранения фактических расходов по категориям
    const expensesByCategory = {};
    
    // Подсчет фактических расходов по категориям
    transactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
            if (!expensesByCategory[t.category]) {
                expensesByCategory[t.category] = 0;
            }
            expensesByCategory[t.category] += t.amount;
        });
    
    // Проверка на наличие данных
    if (budget.categories.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="5" class="text-center">Нет категорий бюджета для выбранного месяца</td>
        `;
        budgetTable.appendChild(row);
        return;
    }
    
    // Заполнение таблицы данными
    budget.categories.forEach(category => {
        const row = document.createElement('tr');
        row.dataset.id = category.id;
        
        // Получение названия категории
        const categoryObj = window.app.categories.expense.find(c => c.id === category.id);
        const categoryName = categoryObj ? categoryObj.name : category.id;
        
        // Получение фактических расходов по категории
        const actualAmount = expensesByCategory[category.id] || 0;
        
        // Расчет разницы
        const difference = category.amount - actualAmount;
        const differenceClass = difference >= 0 ? 'income' : 'expense';
        
        row.innerHTML = `
            <td>${categoryName}</td>
            <td>${formatCurrency(category.amount)}</td>
            <td>${formatCurrency(actualAmount)}</td>
            <td class="${differenceClass}">${formatCurrency(difference)}</td>
            <td>
                <button class="btn btn-sm edit-budget-category" data-id="${category.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger delete-budget-category" data-id="${category.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        budgetTable.appendChild(row);
    });
    
    // Добавление обработчиков для кнопок редактирования и удаления
    setupBudgetCategoryButtons();
}

// Настройка кнопок управления категориями бюджета
function setupBudgetCategoryButtons() {
    // Обработчики для кнопок удаления
    document.querySelectorAll('.delete-budget-category').forEach(btn => {
        btn.addEventListener('click', function() {
            const categoryId = this.getAttribute('data-id');
            const currentMonth = document.getElementById('budget-month').value;
            
            if (confirm('Вы уверены, что хотите удалить эту категорию бюджета?')) {
                // Находим индекс категории
                const budget = window.app.budgets[currentMonth];
                if (budget) {
                    const index = budget.categories.findIndex(c => c.id === categoryId);
                    
                    if (index !== -1) {
                        // Удаляем категорию
                        budget.categories.splice(index, 1);
                        
                        // Сохраняем данные
                        saveAppData();
                        
                        // Обновляем интерфейс
                        updateBudget();
                    }
                }
            }
        });
    });
    
    // Обработчики для кнопок редактирования
    document.querySelectorAll('.edit-budget-category').forEach(btn => {
        btn.addEventListener('click', function() {
            const categoryId = this.getAttribute('data-id');
            const currentMonth = document.getElementById('budget-month').value;
            
            // Открываем модальное окно
            openModal('edit-budget-category-modal');
            
            // Получаем категорию бюджета
            const budget = window.app.budgets[currentMonth];
            if (budget) {
                const category = budget.categories.find(c => c.id === categoryId);
                
                if (category) {
                    // Заполнение списка категорий
                    const budgetCategorySelect = document.getElementById('budget-category-name');
                    budgetCategorySelect.innerHTML = '';
                    
                    window.app.categories.expense.forEach(cat => {
                        const option = document.createElement('option');
                        option.value = cat.id;
                        option.textContent = cat.name;
                        budgetCategorySelect.appendChild(option);
                    });
                    
                    // Заполняем форму данными
                    document.getElementById('budget-category-id').value = category.id;
                    document.getElementById('budget-category-name').value = category.id;
                    document.getElementById('budget-category-amount').value = category.amount;
                }
            }
        });
    });
} 