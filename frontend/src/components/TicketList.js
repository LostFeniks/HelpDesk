import { TicketItem } from './TicketItem';

export class TicketList {
    constructor(api) {
        this.api = api;
        this.container = document.getElementById('ticketList');
        this.tickets = [];
        this.loading = false;
    }

    async loadTickets() {
        this.showLoading();
        try {
            this.tickets = await this.api.getAllTickets();
            return this.tickets;
        } catch (error) {
            throw error;
        } finally {
            this.hideLoading();
        }
    }

    async render() {
        try {
            await this.loadTickets();
            
            if (!this.tickets || this.tickets.length === 0) {
                this.container.innerHTML = `
                    <div class="empty-state">
                        <p>Нет тикетов</p>
                        <p class="empty-state-sub">Нажмите "Добавить тикет" для создания</p>
                    </div>
                `;
                return;
            }

            this.container.innerHTML = '';
            
            // Сортируем по дате создания (новые сверху)
            const sortedTickets = [...this.tickets].sort((a, b) => b.created - a.created);
            
            for (const ticket of sortedTickets) {
                const ticketItem = new TicketItem(ticket);
                const element = await ticketItem.render();
                
                // Добавляем обработчики событий для редактирования и удаления
                element.querySelector('.ticket-edit')?.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (window.app) {
                        window.app.showEditTicket(ticket);
                    }
                });

                element.querySelector('.ticket-delete')?.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (window.app) {
                        window.app.showDeleteTicket(ticket.id);
                    }
                });

                element.querySelector('.ticket-status')?.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    try {
                        await this.api.updateTicket(ticket.id, { 
                            status: !ticket.status 
                        });
                        await window.app.refreshTickets();
                    } catch (error) {
                        console.error('Error toggling status:', error);
                        alert('Ошибка обновления статуса');
                    }
                });

                element.addEventListener('click', async () => {
                    try {
                        const fullTicket = await this.api.getTicketById(ticket.id);
                        this.showTicketDetails(fullTicket);
                    } catch (error) {
                        console.error('Error loading ticket details:', error);
                        alert('Ошибка загрузки деталей тикета');
                    }
                });

                this.container.appendChild(element);
            }
        } catch (error) {
            throw error;
        }
    }

    showLoading() {
        this.loading = true;
        this.container.innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <p>Загрузка тикетов...</p>
            </div>
        `;
    }

    hideLoading() {
        this.loading = false;
    }

    showError(message) {
        this.container.innerHTML = `
            <div class="error-state">
                <p>❌ ${message}</p>
                <button onclick="window.app.refreshTickets()" class="btn btn-secondary">
                    Попробовать снова
                </button>
            </div>
        `;
    }

    showTicketDetails(ticket) {
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
            </div>
        `;
        
        modal.style.display = 'block';
        
        // Обработка закрытия
        modal.querySelector('.modal-close').addEventListener('click', () => {
            if (window.app) {
                window.app.closeModal();
            }
        });
    }
}