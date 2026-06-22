export class ApiClient {
    constructor(baseUrl = '') {
        // Используем правильный URL для бэкенда
        this.baseUrl = baseUrl || 'http://localhost:7070';
    }

    async request(method, params = {}, body = null) {
        const url = new URL(`${this.baseUrl}/`);
        url.searchParams.append('method', method);
        
        Object.keys(params).forEach(key => {
            url.searchParams.append(key, params[key]);
        });

        const options = {
            method: body ? 'POST' : 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        try {
            console.log('Sending request to:', url.toString(), options);
            const response = await fetch(url.toString(), options);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            if (response.status === 204) {
                return null;
            }

            const data = await response.json();
            console.log('Response:', data);
            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    async getAllTickets() {
        return this.request('allTickets');
    }

    async getTicketById(id) {
        return this.request('ticketById', { id });
    }

    async createTicket(ticketData) {
        return this.request('createTicket', {}, ticketData);
    }

    async updateTicket(id, ticketData) {
        return this.request('updateById', { id }, ticketData);
    }

    async deleteTicket(id) {
        return this.request('deleteById', { id });
    }
}