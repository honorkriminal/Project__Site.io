// Инициализация панели управления
document.addEventListener('DOMContentLoaded', function() {
    // Обновление панели управления при загрузке страницы
    if (window.app && window.app.currentUser) {
        updateDashboard();
    }
});

// Обновление панели управления
function updateDashboard() {
    updateBalanceSummary();
    updateExpensesChart();
    updateBalanceChart();
    updateRecentTransactions();
}

// Обновление сводки баланса
function updateBalanceSummary() {
    const transactions = window.app.transactions;
    
    // Расчет общего баланса
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = totalIncome - totalExpense;
    
    // Расчет доходов и расходов за текущий месяц
    const currentMonth = getCurrentMonth();
    const startOfMonth = currentMonth + '-01';
    
    const monthIncome = transactions
        .filter(t => t.type === 'income' && t.date.startsWith(currentMonth))
        .reduce((sum, t) => sum + t.amount, 0);
    
    const monthExpense = transactions
        .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth))
        .reduce((sum, t) => sum + t.amount, 0);
    
    // Обновление интерфейса
    document.getElementById('total-balance').textContent = formatCurrency(balance);
    document.getElementById('month-income').textContent = formatCurrency(monthIncome);
    document.getElementById('month-expense').textContent = formatCurrency(monthExpense);
}

// Обновление диаграммы расходов
function updateExpensesChart() {
    const transactions = window.app.transactions;
    const categories = window.app.categories.expense;
    
    // Расчет расходов по категориям за текущий месяц
    const currentMonth = getCurrentMonth();
    
    // Объект для хранения сумм по категориям
    const expensesByCategory = {};
    
    // Инициализация всех категорий с нулевыми значениями
    categories.forEach(category => {
        expensesByCategory[category.id] = 0;
    });
    
    // Подсчет расходов по категориям
    transactions
        .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth))
        .forEach(t => {
            expensesByCategory[t.category] += t.amount;
        });
    
    // Подготовка данных для диаграммы
    const labels = [];
    const data = [];
    const backgroundColors = [
        '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', 
        '#1abc9c', '#d35400', '#34495e', '#7f8c8d', '#c0392b'
    ];
    
    // Заполнение данных, пропуская категории с нулевыми значениями
    let colorIndex = 0;
    for (const categoryId in expensesByCategory) {
        if (expensesByCategory[categoryId] > 0) {
            const category = categories.find(c => c.id === categoryId);
            labels.push(category ? category.name : categoryId);
            data.push(expensesByCategory[categoryId]);
        }
    }
    
    // Проверка наличия элемента холста
    const chartCanvas = document.getElementById('expenses-chart');
    if (!chartCanvas) return;
    
    // Проверка на наличие данных
    if (data.length === 0) {
        chartCanvas.style.display = 'none';
        return;
    } else {
        chartCanvas.style.display = 'block';
    }
    
    // Создание или обновление диаграммы
    if (window.expensesChart) {
        window.expensesChart.data.labels = labels;
        window.expensesChart.data.datasets[0].data = data;
        window.expensesChart.update();
    } else {
        window.expensesChart = new Chart(chartCanvas, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: backgroundColors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                    }
                }
            }
        });
    }
}

// Обновление диаграммы баланса
function updateBalanceChart() {
    const transactions = window.app.transactions;
    
    // Получение данных за последние 30 дней
    const today = new Date();
    const last30Days = [];
    
    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        last30Days.push(date.toISOString().split('T')[0]);
    }
    
    // Подготовка данных для графика
    const balanceData = [];
    let runningBalance = 0;
    
    last30Days.forEach(date => {
        // Находим все транзакции за этот день
        const dayTransactions = transactions.filter(t => t.date === date);
        
        // Рассчитываем изменение баланса за день
        const dayIncome = dayTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const dayExpense = dayTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        runningBalance += dayIncome - dayExpense;
        balanceData.push(runningBalance);
    });
    
    // Форматирование дат для отображения
    const formattedDates = last30Days.map(date => {
        const [year, month, day] = date.split('-');
        return `${day}.${month}`;
    });
    
    // Проверка наличия элемента холста
    const chartCanvas = document.getElementById('balance-chart');
    if (!chartCanvas) return;
    
    // Создание или обновление графика
    if (window.balanceChart) {
        window.balanceChart.data.labels = formattedDates;
        window.balanceChart.data.datasets[0].data = balanceData;
        window.balanceChart.update();
    } else {
        window.balanceChart = new Chart(chartCanvas, {
            type: 'line',
            data: {
                labels: formattedDates,
                datasets: [{
                    label: 'Баланс',
                    data: balanceData,
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            maxTicksLimit: 10
                        }
                    },
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
}

// Обновление списка последних транзакций
function updateRecentTransactions() {
    const transactions = window.app.transactions;
    const tableBody = document.getElementById('recent-transactions-body');
    
    if (!tableBody) return;
    
    // Очищаем текущее содержимое таблицы
    tableBody.innerHTML = '';
    
    // Получаем 5 последних транзакций
    const recentTransactions = [...transactions]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
    
    if (recentTransactions.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="4" class="text-center">Нет транзакций</td>
        `;
        tableBody.appendChild(row);
        return;
    }
    
    // Заполняем таблицу данными
    recentTransactions.forEach(transaction => {
        const row = document.createElement('tr');
        
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
        
        row.innerHTML = `
            <td>${formattedDate}</td>
            <td>${categoryName}</td>
            <td>${transaction.description}</td>
            <td class="${amountClass}">${amountPrefix}${formatCurrency(transaction.amount)}</td>
        `;
        
        tableBody.appendChild(row);
    });
} 