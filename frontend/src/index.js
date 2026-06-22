import './styles.css';

console.log('🚀 HelpDesk приложение запущено');

const API_URL = 'http://localhost:7070';

// Загрузка тикетов
async function loadTickets() {
    console.log('🔄 loadTickets вызван');
    const container = document.getElementById('ticketList');
    console.log('📦 Контейнер ticketList найден:', !!container);
    
    try {
        console.log('📥 Загрузка тикетов...');
        console.log('📥 URL запроса:', `${API_URL}/?method=allTickets`);
        
        const response = await fetch(`${API_URL}/?method=allTickets`);
        console.log('📡 Ответ получен, статус:', response.status);
        console.log('📡 Статус текстовый:', response.statusText);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Текст ошибки:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        
        const tickets = await response.json();
        console.log('✅ Получены тикеты:', tickets);
        console.log('📊 Количество тикетов:', tickets.length);
        
        if (!container) {
            console.error('❌ Контейнер ticketList не найден!');
            return;
        }
        
        if (!tickets || tickets.length === 0) {
            console.log('📭 Нет тикетов, показываем пустое состояние');
            container.innerHTML = `
                <div class="empty-state">
                    <p>Нет тикетов</p>
                    <p class="empty-state-sub">Нажмите "Добавить тикет" для создания</p>
                </div>
            `;
            return;
        }
        
        console.log('🔄 Рендеринг тикетов...');
        container.innerHTML = tickets.map(ticket => `
            <div class="ticket-item" data-id="${ticket.id}">
                <div class="ticket-status ${ticket.status ? 'status-done' : 'status-open'}">
                    ${ticket.status ? '✅' : '⬜'}
                </div>
                <div class="ticket-content">
                    <div class="ticket-name">${ticket.name}</div>
                    <div class="ticket-created">
                        ${new Date(ticket.created).toLocaleString('ru-RU')}
                    </div>
                </div>
                <div class="ticket-actions">
                    <button class="ticket-edit" data-id="${ticket.id}" title="Редактировать">✎</button>
                    <button class="ticket-delete" data-id="${ticket.id}" title="Удалить">✕</button>
                </div>
            </div>
        `).join('');
        
        console.log('✅ Список тикетов обновлен, элементов:', container.children.length);
        
        // Добавляем обработчики для кнопок
        document.querySelectorAll('.ticket-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                const ticket = tickets.find(t => t.id === id);
                if (ticket) showEditForm(ticket);
            });
        });
        
        document.querySelectorAll('.ticket-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                if (confirm('Удалить тикет?')) deleteTicket(id);
            });
        });
        
        document.querySelectorAll('.ticket-item').forEach(item => {
            item.addEventListener('click', async () => {
                const id = item.dataset.id;
                try {
                    const response = await fetch(`${API_URL}/?method=ticketById&id=${id}`);
                    const ticket = await response.json();
                    showTicketDetails(ticket);
                } catch (error) {
                    console.error('Ошибка загрузки деталей:', error);
                }
            });
        });
        
        document.querySelectorAll('.ticket-status').forEach(statusEl => {
            statusEl.addEventListener('click', async (e) => {
                e.stopPropagation();
                const item = statusEl.closest('.ticket-item');
                const id = item.dataset.id;
                const ticket = tickets.find(t => t.id === id);
                if (ticket) {
                    await updateTicketStatus(id, !ticket.status);
                }
            });
        });
        
    } catch (error) {
        console.error('❌ ОШИБКА загрузки:', error);
        if (container) {
            container.innerHTML = `
                <div class="error-state">
                    <p>❌ Ошибка загрузки тикетов: ${error.message}</p>
                    <button onclick="loadTickets()" class="btn btn-secondary">
                        Попробовать снова
                    </button>
                </div>
            `;
        }
    }
}

// Создание тикета с таймаутом
async function createTicket(data) {
    console.log('📤 createTicket вызван с данными:', data);
    console.log('📤 Отправляем запрос на:', `${API_URL}/?method=createTicket`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
        console.log('⏰ Таймаут запроса!');
        controller.abort();
    }, 5000);
    
    try {
        const response = await fetch(`${API_URL}/?method=createTicket`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        console.log('📡 Ответ от сервера получен');
        console.log('📡 Статус ответа:', response.status);
        console.log('📡 OK?:', response.ok);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Текст ошибки:', errorText);
            let error;
            try {
                error = JSON.parse(errorText);
            } catch (e) {
                error = { message: errorText || 'Неизвестная ошибка' };
            }
            throw new Error(error.message || 'Ошибка создания');
        }
        
        const result = await response.json();
        console.log('✅ Тикет создан успешно!');
        console.log('✅ Результат:', result);
        
        console.log('🔄 Обновляем список тикетов...');
        await loadTickets();
        console.log('✅ Список обновлен');
        
        return result;
    } catch (error) {
        clearTimeout(timeoutId);
        console.error('❌ ОШИБКА в createTicket:', error);
        console.error('❌ Тип ошибки:', error.name);
        console.error('❌ Сообщение:', error.message);
        if (error.name === 'AbortError') {
            console.error('❌ Запрос был отменен из-за таймаута!');
            throw new Error('Превышено время ожидания ответа от сервера');
        }
        throw error;
    }
}

// Остальные функции остаются без изменений...
async function updateTicketStatus(id, status) {
    try {
        console.log(`📤 Обновление статуса тикета ${id} на ${status}`);
        const response = await fetch(`${API_URL}/?method=updateById&id=${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status })
        });
        
        if (!response.ok) throw new Error('Ошибка обновления');
        
        console.log('✅ Статус обновлен');
        await loadTickets();
    } catch (error) {
        console.error('❌ Ошибка обновления статуса:', error);
        alert('Ошибка обновления статуса');
    }
}

async function deleteTicket(id) {
    try {
        console.log(`📤 Удаление тикета ${id}`);
        const response = await fetch(`${API_URL}/?method=deleteById&id=${id}`);
        
        if (!response.ok) throw new Error('Ошибка удаления');
        
        console.log('✅ Тикет удален');
        await loadTickets();
    } catch (error) {
        console.error('❌ Ошибка удаления:', error);
        alert('Ошибка удаления');
    }
}

function showCreateForm() {
    console.log('📝 Открытие формы создания');
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');
    
    modalBody.innerHTML = `
        <div class="ticket-form">
            <h2>Добавить тикет</h2>
            <form id="ticketForm">
                <div class="form-group">
                    <label for="ticketName">Краткое описание</label>
                    <input type="text" id="ticketName" class="form-control" required>
                </div>
                <div class="form-group">
                    <label for="ticketDescription">Полное описание</label>
                    <textarea id="ticketDescription" class="form-control" rows="4"></textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">Отмена</button>
                    <button type="submit" class="btn btn-primary">Создать</button>
                </div>
            </form>
        </div>
    `;
    
    modal.style.display = 'block';
    
    document.getElementById('ticketForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('🔄 Форма создания отправлена');
        
        const name = document.getElementById('ticketName').value.trim();
        const description = document.getElementById('ticketDescription').value.trim();
        
        console.log('📝 Данные формы:', { name, description });
        
        if (!name) {
            alert('Введите название');
            return;
        }
        
        try {
            console.log('🔄 Начинаем создание...');
            const result = await createTicket({ name, description });
            console.log('🔄 Результат создания:', result);
            console.log('🔄 Закрываем модальное окно...');
            closeModal();
            console.log('🔄 Явно обновляем список...');
            await loadTickets();
            console.log('✅ Готово!');
        } catch (error) {
            console.error('❌ Ошибка в обработчике формы:', error);
            alert('Ошибка создания: ' + error.message);
        }
    });
}

function showEditForm(ticket) {
    console.log('📝 Открытие формы редактирования', ticket);
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');
    
    modalBody.innerHTML = `
        <div class="ticket-form">
            <h2>Редактировать тикет</h2>
            <form id="ticketForm">
                <div class="form-group">
                    <label for="ticketName">Краткое описание</label>
                    <input type="text" id="ticketName" class="form-control" value="${ticket.name}" required>
                </div>
                <div class="form-group">
                    <label for="ticketDescription">Полное описание</label>
                    <textarea id="ticketDescription" class="form-control" rows="4">${ticket.description || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="ticketStatus" ${ticket.status ? 'checked' : ''}>
                        Выполнено
                    </label>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">Отмена</button>
                    <button type="submit" class="btn btn-primary">Сохранить</button>
                </div>
            </form>
        </div>
    `;
    
    modal.style.display = 'block';
    
    document.getElementById('ticketForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('ticketName').value.trim();
        const description = document.getElementById('ticketDescription').value.trim();
        const status = document.getElementById('ticketStatus').checked;
        
        if (!name) {
            alert('Введите название');
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/?method=updateById&id=${ticket.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description, status })
            });
            
            if (!response.ok) throw new Error('Ошибка обновления');
            
            closeModal();
            await loadTickets();
        } catch (error) {
            alert('Ошибка обновления: ' + error.message);
        }
    });
}

function showTicketDetails(ticket) {
    console.log('📋 Просмотр деталей', ticket);
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');
    
    modalBody.innerHTML = `
        <div class="ticket-details">
            <h3>${ticket.name}</h3>
            <div class="ticket-details-meta">
                <span class="ticket-status-badge ${ticket.status ? 'status-done' : 'status-open'}">
                    ${ticket.status ? '✅ Выполнено' : '⏳ В работе'}
                </span>
                <span class="ticket-date">
                    Создан: ${new Date(ticket.created).toLocaleString('ru-RU')}
                </span>
            </div>
            <div class="ticket-details-description">
                ${ticket.description || 'Описание отсутствует'}
            </div>
            <div class="form-actions">
                <button class="btn btn-secondary" onclick="closeModal()">Закрыть</button>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

function closeModal() {
    console.log('🔒 Закрытие модального окна');
    document.getElementById('modal').style.display = 'none';
    document.getElementById('modalBody').innerHTML = '';
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM загружен');
    
    const addBtn = document.getElementById('addTicketBtn');
    if (addBtn) {
        addBtn.addEventListener('click', showCreateForm);
        console.log('✅ Кнопка добавления найдена');
    } else {
        console.error('❌ Кнопка addTicketBtn не найдена!');
    }
    
    const closeBtn = document.querySelector('.modal-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
        console.log('✅ Кнопка закрытия найдена');
    } else {
        console.error('❌ Кнопка .modal-close не найдена!');
    }
    
    const modal = document.getElementById('modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) closeModal();
        });
        console.log('✅ Модальное окно найдено');
    } else {
        console.error('❌ Модальное окно #modal не найдено!');
    }
    
    console.log('🔄 Начальная загрузка тикетов...');
    loadTickets();
});

window.loadTickets = loadTickets;
window.closeModal = closeModal;
window.showCreateForm = showCreateForm;
window.showEditForm = showEditForm;
window.showTicketDetails = showTicketDetails;
window.deleteTicket = deleteTicket;

console.log('✅ Приложение инициализировано');