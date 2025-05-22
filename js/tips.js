// Инициализация страницы советов
document.addEventListener('DOMContentLoaded', function() {
    // Настройка обработчиков для переключения категорий советов
    setupTipsHandlers();
});

// Настройка обработчиков для страницы советов
function setupTipsHandlers() {
    // Обработчики для переключения категорий советов
    document.querySelectorAll('.tip-category').forEach(btn => {
        btn.addEventListener('click', function() {
            // Удаляем класс active у всех кнопок категорий
            document.querySelectorAll('.tip-category').forEach(b => {
                b.classList.remove('active');
            });
            
            // Добавляем класс active к текущей кнопке
            this.classList.add('active');
            
            // Получаем ID выбранной категории
            const categoryId = this.getAttribute('data-category');
            
            // Скрываем все блоки с советами
            document.querySelectorAll('.tip-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Показываем блок с советами выбранной категории
            document.getElementById(categoryId + '-tips').classList.add('active');
        });
    });
} 