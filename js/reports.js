// Инициализация страницы отчетов
document.addEventListener('DOMContentLoaded', function() {
    // Установка обработчиков для страницы отчетов
    setupReportsHandlers();
});

// Настройка обработчиков для страницы отчетов
function setupReportsHandlers() {
    // Установка текущего месяца по умолчанию
    const reportDate = document.getElementById('report-date');
    if (reportDate) {
        reportDate.value = getCurrentMonth();
    }
    
    // Обработчик кнопки генерации отчета
    const generateReportBtn = document.getElementById('generate-report');
    if (generateReportBtn) {
        generateReportBtn.addEventListener('click', function() {
            updateReports();
        });
    }
    
    // Обработчики кнопок экспорта
    const exportPdfBtn = document.getElementById('export-pdf');
    if (exportPdfBtn) {
        exportPdfBtn.addEventListener('click', function() {
            alert('Экспорт в PDF будет доступен в следующей версии приложения');
        });
    }
    
    const exportExcelBtn = document.getElementById('export-excel');
    if (exportExcelBtn) {
        exportExcelBtn.addEventListener('click', function() {
            alert('Экспорт в Excel будет доступен в следующей версии приложения');
        });
    }
}

// Обновление отчетов
function updateReports() {
    // Получение выбранного периода и даты
    const reportPeriod = document.getElementById('report-period').value;
    const reportDate = document.getElementById('report-date').value;
    
    if (!reportDate) return;
    
    // Определение диапазона дат для отчета
    const dateRange = getDateRangeForReport(reportPeriod, reportDate);
    const startDate = dateRange.startDate;
    const endDate = dateRange.endDate;
    
    // Фильтрация транзакций по выбранному периоду
    const transactions = window.app.transactions.filter(t => {
        return t.date >= startDate && t.date <= endDate;
    });
    
    // Обновление графиков и показателей
    updateIncomeExpenseChart(transactions, reportPeriod);
    updateExpenseCategoriesChart(transactions);
    updateReportIndicators(transactions, reportPeriod, reportDate);
}

// Определение диапазона дат для отчета
function getDateRangeForReport(period, date) {
    const [year, month] = date.split('-').map(Number);
    let startDate, endDate;
    
    switch (period) {
        case 'month':
            // Начало и конец месяца
            startDate = `${year}-${String(month).padStart(2, '0')}-01`;
            endDate = new Date(year, month, 0).toISOString().split('T')[0]; // Последний день месяца
            break;
        case 'quarter':
            // Определение квартала
            const quarterStartMonth = Math.floor((month - 1) / 3) * 3 + 1;
            startDate = `${year}-${String(quarterStartMonth).padStart(2, '0')}-01`;
            endDate = new Date(year, quarterStartMonth + 2, 0).toISOString().split('T')[0]; // Последний день квартала
            break;
        case 'year':
            // Весь год
            startDate = `${year}-01-01`;
            endDate = `${year}-12-31`;
            break;
    }
    
    return { startDate, endDate };
}

// Обновление графика доходов и расходов
function updateIncomeExpenseChart(transactions, period) {
    // Подготовка данных в зависимости от периода
    let labels = [];
    let incomeData = [];
    let expenseData = [];
    
    if (period === 'month') {
        // Для месяца группируем по дням
        const daysInMonth = 31; // Максимальное количество дней в месяце
        
        // Инициализация массивов
        for (let i = 1; i <= daysInMonth; i++) {
            labels.push(i);
            incomeData.push(0);
            expenseData.push(0);
        }
        
        // Заполнение данными
        transactions.forEach(t => {
            const day = parseInt(t.date.split('-')[2]);
            if (t.type === 'income') {
                incomeData[day - 1] += t.amount;
            } else {
                expenseData[day - 1] += t.amount;
            }
        });
        
        // Удаляем лишние дни, если в месяце меньше 31 дня
        const maxDay = Math.max(...transactions.map(t => parseInt(t.date.split('-')[2])));
        if (maxDay < daysInMonth) {
            labels = labels.slice(0, maxDay);
            incomeData = incomeData.slice(0, maxDay);
            expenseData = expenseData.slice(0, maxDay);
        }
    } else if (period === 'quarter') {
        // Для квартала группируем по месяцам
        labels = ['Месяц 1', 'Месяц 2', 'Месяц 3'];
        incomeData = [0, 0, 0];
        expenseData = [0, 0, 0];
        
        // Определение месяца начала квартала
        const firstTransaction = transactions.sort((a, b) => a.date.localeCompare(b.date))[0];
        if (!firstTransaction) return;
        
        const startMonth = parseInt(firstTransaction.date.split('-')[1]);
        const quarterStartMonth = Math.floor((startMonth - 1) / 3) * 3 + 1;
        
        // Заполнение данными
        transactions.forEach(t => {
            const month = parseInt(t.date.split('-')[1]);
            const quarterIndex = month - quarterStartMonth;
            
            if (quarterIndex >= 0 && quarterIndex < 3) {
                if (t.type === 'income') {
                    incomeData[quarterIndex] += t.amount;
                } else {
                    expenseData[quarterIndex] += t.amount;
                }
            }
        });
        
        // Замена на реальные названия месяцев
        const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 
                           'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
        labels = [
            monthNames[quarterStartMonth - 1],
            monthNames[quarterStartMonth],
            monthNames[quarterStartMonth + 1]
        ];
    } else if (period === 'year') {
        // Для года группируем по месяцам
        labels = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
        incomeData = Array(12).fill(0);
        expenseData = Array(12).fill(0);
        
        // Заполнение данными
        transactions.forEach(t => {
            const month = parseInt(t.date.split('-')[1]) - 1;
            if (t.type === 'income') {
                incomeData[month] += t.amount;
            } else {
                expenseData[month] += t.amount;
            }
        });
    }
    
    // Получение контекста для графика
    const chartCanvas = document.getElementById('income-expense-chart');
    if (!chartCanvas) return;
    
    // Создание или обновление графика
    if (window.incomeExpenseChart) {
        window.incomeExpenseChart.data.labels = labels;
        window.incomeExpenseChart.data.datasets[0].data = incomeData;
        window.incomeExpenseChart.data.datasets[1].data = expenseData;
        window.incomeExpenseChart.update();
    } else {
        window.incomeExpenseChart = new Chart(chartCanvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Доходы',
                        data: incomeData,
                        backgroundColor: 'rgba(46, 204, 113, 0.5)',
                        borderColor: 'rgba(46, 204, 113, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Расходы',
                        data: expenseData,
                        backgroundColor: 'rgba(231, 76, 60, 0.5)',
                        borderColor: 'rgba(231, 76, 60, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        stacked: false
                    },
                    y: {
                        stacked: false,
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

// Обновление графика расходов по категориям
function updateExpenseCategoriesChart(transactions) {
    // Фильтрация только расходов
    const expenses = transactions.filter(t => t.type === 'expense');
    
    // Группировка расходов по категориям
    const expensesByCategory = {};
    
    expenses.forEach(t => {
        if (!expensesByCategory[t.category]) {
            expensesByCategory[t.category] = 0;
        }
        expensesByCategory[t.category] += t.amount;
    });
    
    // Подготовка данных для графика
    const labels = [];
    const data = [];
    const backgroundColors = [
        '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', 
        '#1abc9c', '#d35400', '#34495e', '#7f8c8d', '#c0392b'
    ];
    
    // Заполнение данных
    Object.keys(expensesByCategory).forEach((categoryId, index) => {
        const category = window.app.categories.expense.find(c => c.id === categoryId);
        labels.push(category ? category.name : categoryId);
        data.push(expensesByCategory[categoryId]);
    });
    
    // Проверка наличия элемента холста
    const chartCanvas = document.getElementById('expense-categories-chart');
    if (!chartCanvas) return;
    
    // Проверка на наличие данных
    if (data.length === 0) {
        chartCanvas.style.display = 'none';
        return;
    } else {
        chartCanvas.style.display = 'block';
    }
    
    // Создание или обновление диаграммы
    if (window.expenseCategoriesChart) {
        window.expenseCategoriesChart.data.labels = labels;
        window.expenseCategoriesChart.data.datasets[0].data = data;
        window.expenseCategoriesChart.update();
    } else {
        window.expenseCategoriesChart = new Chart(chartCanvas, {
            type: 'doughnut',
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

// Обновление индикаторов отчета
function updateReportIndicators(transactions, period, date) {
    // Расчет общего дохода и расхода
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    // Расчет баланса
    const balance = totalIncome - totalExpense;
    
    // Определение самой большой категории расходов
    const expensesByCategory = {};
    
    transactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
            if (!expensesByCategory[t.category]) {
                expensesByCategory[t.category] = 0;
            }
            expensesByCategory[t.category] += t.amount;
        });
    
    let largestExpenseCategory = '';
    let largestExpenseAmount = 0;
    
    for (const categoryId in expensesByCategory) {
        if (expensesByCategory[categoryId] > largestExpenseAmount) {
            largestExpenseAmount = expensesByCategory[categoryId];
            largestExpenseCategory = categoryId;
        }
    }
    
    // Получение названия категории
    const categoryObj = window.app.categories.expense.find(c => c.id === largestExpenseCategory);
    const categoryName = categoryObj ? categoryObj.name : largestExpenseCategory;
    
    // Расчет экономии к бюджету
    let budgetSavings = 0;
    
    // Получение соответствующего бюджета
    const [year, month] = date.split('-');
    const budgetMonth = `${year}-${month}`;
    const budget = window.app.budgets[budgetMonth];
    
    if (budget) {
        const plannedExpense = budget.categories.reduce((sum, cat) => sum + cat.amount, 0);
        budgetSavings = plannedExpense - totalExpense;
    }
    
    // Обновление интерфейса
    document.getElementById('report-total-income').textContent = formatCurrency(totalIncome);
    document.getElementById('report-total-expense').textContent = formatCurrency(totalExpense);
    document.getElementById('report-balance').textContent = formatCurrency(balance);
    
    if (largestExpenseCategory) {
        document.getElementById('report-largest-expense').textContent = `${categoryName} (${formatCurrency(largestExpenseAmount)})`;
    } else {
        document.getElementById('report-largest-expense').textContent = '-';
    }
    
    document.getElementById('report-budget-savings').textContent = formatCurrency(budgetSavings);
} 