document.addEventListener('DOMContentLoaded', async () => {
    const notificationsList = document.getElementById('notificationsList');
    const emptyState = document.getElementById('emptyState');
    const markAllReadBtn = document.getElementById('markAllReadBtn');

    /**
     * Carrega e exibe as notificações
     */
    async function loadNotifications() {
        try {
            const notifications = await apiGet('/api/notificacoes');

            if (!notifications || notifications.length === 0) {
                notificationsList.style.display = 'none';
                emptyState.style.display = 'block';
                return;
            }

            notificationsList.style.display = 'block';
            emptyState.style.display = 'none';
            notificationsList.innerHTML = '';

            notifications.forEach(notification => {
                const notifEl = createNotificationElement(notification);
                notificationsList.appendChild(notifEl);
            });
        } catch (error) {
            console.error('Erro ao carregar notificações:', error);
            notificationsList.innerHTML = '<p class="error">Erro ao carregar notificações.</p>';
        }
    }

    /**
     * Cria elemento HTML para uma notificação
     */
    function createNotificationElement(notification) {
        const div = document.createElement('div');
        div.className = `notification-item ${notification.read ? 'read' : 'unread'} ${notification.type.toLowerCase()}`;
        div.dataset.id = notification.id;

        const iconMap = {
            'SUCCESS': '✓',
            'INFO': 'ℹ',
            'WARNING': '⚠',
            'ERROR': '✕'
        };

        const icon = iconMap[notification.type] || 'ℹ';
        const date = new Date(notification.createdAt).toLocaleString('pt-BR');

        div.innerHTML = `
      <div class="notification-icon">${icon}</div>
      <div class="notification-content">
        <h3>${notification.title}</h3>
        <p>${notification.message}</p>
        <span class="notification-date">${date}</span>
      </div>
      ${!notification.read ? '<button class="mark-read-btn" data-id="' + notification.id + '">Marcar como lida</button>' : ''}
    `;

        // Adicionar listener para marcar como lida
        if (!notification.read) {
            const markReadBtn = div.querySelector('.mark-read-btn');
            markReadBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                await markAsRead(notification.id);
            });
        }

        return div;
    }

    /**
     * Marca uma notificação como lida
     */
    async function markAsRead(notificationId) {
        try {
            await apiPut(`/api/notificacoes/${notificationId}/marcar-lida`, {});
            await loadNotifications(); // Recarregar lista
        } catch (error) {
            console.error('Erro ao marcar notificação como lida:', error);
        }
    }

    /**
     * Marca todas as notificações como lidas
     */
    async function markAllAsRead() {
        try {
            await apiPut('/api/notificacoes/marcar-todas-lidas', {});
            await loadNotifications(); // Recarregar lista
        } catch (error) {
            console.error('Erro ao marcar todas como lidas:', error);
        }
    }

    // Event listeners
    markAllReadBtn.addEventListener('click', markAllAsRead);

    // Carregar notificações ao iniciar
    await loadNotifications();

    // Atualizar a cada 30 segundos
    setInterval(loadNotifications, 30000);
});
