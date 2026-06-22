export class TicketForm {
    constructor() {
        this.form = null;
        this.submitCallback = null;
    }

    render(ticket = null) {
        const isEdit = !!ticket;
        const title = isEdit ? 'Редактировать тикет' : 'Добавить тикет';
        const submitText = isEdit ? 'Сохранить' : 'Создать';
        
        return `
            <div class="ticket-form">
                <h2>${title}</h2>
                <form id="ticketForm">
                    <div class="form-group">
                        <label for="ticketName">Краткое описание</label>
                        <input 
                            type="text" 
                            id="ticketName" 
                            class="form-control" 
                            value="${ticket ? this.escapeHtml(ticket.name) : ''}"
                            required 
                            placeholder="Введите краткое описание"
                        >
                    </div>
                    <div class="form-group">
                        <label for="ticketDescription">Полное описание</label>
                        <textarea 
                            id="ticketDescription" 
                            class="form-control" 
                            rows="4"
                            placeholder="Введите подробное описание"
                        >${ticket ? this.escapeHtml(ticket.description || '') : ''}</textarea>
                    </div>
                    ${isEdit ? `
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="ticketStatus" ${ticket.status ? 'checked' : ''}>
                                Выполнено
                            </label>
                        </div>
                    ` : ''}
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="window.app.closeModal()">
                            Отмена
                        </button>
                        <button type="submit" class="btn btn-primary">
                            ${submitText}
                        </button>
                    </div>
                </form>
            </div>
        `;
    }

    bindSubmit(callback) {
        this.submitCallback = callback;
        const form = document.getElementById('ticketForm');
        
        if (form) {
            // Удаляем старые обработчики
            const newForm = form.cloneNode(true);
            form.parentNode.replaceChild(newForm, form);
            
            newForm.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('Form submitted');
                
                const nameInput = document.getElementById('ticketName');
                const descriptionInput = document.getElementById('ticketDescription');
                const statusInput = document.getElementById('ticketStatus');
                
                if (!nameInput) {
                    console.error('Name input not found');
                    return;
                }
                
                const data = {
                    name: nameInput.value.trim(),
                    description: descriptionInput.value.trim() || '',
                };
                
                if (statusInput) {
                    data.status = statusInput.checked;
                }
                
                console.log('Form data:', data);
                
                if (!data.name) {
                    alert('Пожалуйста, введите краткое описание');
                    return;
                }
                
                if (this.submitCallback) {
                    this.submitCallback(data);
                }
            });
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}