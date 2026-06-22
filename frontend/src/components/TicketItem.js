export class TicketItem {
    constructor(ticket) {
        this.ticket = ticket;
    }

    async render() {
        const div = document.createElement('div');
        div.className = 'ticket-item';
        
        const statusClass = this.ticket.status ? 'status-done' : 'status-open';
        
        div.innerHTML = `
            <div class="ticket-status ${statusClass}" title="${this.ticket.status ? 'Отметить как невыполненное' : 'Отметить как выполненное'}">
                ${this.ticket.status ? '✅' : '⬜'}
            </div>
            <div class="ticket-content">
                <div class="ticket-name">${this.ticket.name}</div>
                <div class="ticket-created">
                    ${new Date(this.ticket.created).toLocaleString('ru-RU')}
                </div>
            </div>
            <div class="ticket-actions">
                <button class="ticket-edit" title="Редактировать">✎</button>
                <button class="ticket-delete" title="Удалить">✕</button>
            </div>
        `;
        
        return div;
    }
}