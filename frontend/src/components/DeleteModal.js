export class DeleteModal {
    constructor() {
        this.confirmCallback = null;
        this.cancelCallback = null;
    }

    render() {
        return `
            <div class="delete-modal">
                <h2>Удалить тикет</h2>
                <p>Вы действительно хотите удалить этот тикет?</p>
                <p class="delete-warning">Это действие не может быть отменено.</p>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" id="deleteCancel">
                        Отмена
                    </button>
                    <button type="button" class="btn btn-danger" id="deleteConfirm">
                        Удалить
                    </button>
                </div>
            </div>
        `;
    }

    bindConfirm(callback) {
        this.confirmCallback = callback;
        const confirmBtn = document.getElementById('deleteConfirm');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                if (this.confirmCallback) {
                    this.confirmCallback();
                }
            });
        }
    }

    bindCancel(callback) {
        this.cancelCallback = callback;
        const cancelBtn = document.getElementById('deleteCancel');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                if (this.cancelCallback) {
                    this.cancelCallback();
                }
            });
        }
    }
}