document.addEventListener('DOMContentLoaded', async () => {
    const reservationsList = document.getElementById('reservationsList');
    const emptyState = document.getElementById('emptyState');
    const cancelModal = document.getElementById('cancelModal');
    const confirmCancelBtn = document.getElementById('confirmCancel');
    const closeCancelModalBtn = document.getElementById('closeCancelModal');

    let allReservations = [];
    let currentFilter = 'all';
    let reservationToCancel = null;

    // Filter buttons
    const filterButtons = {
        all: document.getElementById('filterAll'),
        active: document.getElementById('filterActive'),
        future: document.getElementById('filterFuture'),
        past: document.getElementById('filterPast'),
        cancelled: document.getElementById('filterCancelled')
    };

    /**
     * Carrega todas as reservas do usuário
     */
    async function loadReservations() {
        try {
            const reservations = await apiGet('/api/reservas/historico');

            if (!reservations || reservations.length === 0) {
                allReservations = [];
                displayReservations([]);
                return;
            }

            allReservations = reservations;
            applyFilter(currentFilter);
        } catch (error) {
            console.error('Erro ao carregar histórico:', error);
            reservationsList.innerHTML = '<p class="error">Erro ao carregar histórico de reservas.</p>';
        }
    }

    /**
     * Aplica filtro às reservas
     */
    function applyFilter(filter) {
        currentFilter = filter;
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        let filtered = allReservations;

        switch (filter) {
            case 'active':
                // Reservas em andamento (data atual entre startDate e endDate)
                filtered = allReservations.filter(r => {
                    const start = new Date(r.startDate);
                    const end = new Date(r.endDate);
                    return r.status === 'CONFIRMED' && now >= start && now <= end;
                });
                break;
            case 'future':
                // Reservas futuras (ainda não iniciadas)
                filtered = allReservations.filter(r => {
                    const start = new Date(r.startDate);
                    return r.status === 'CONFIRMED' && now < start;
                });
                break;
            case 'past':
                // Reservas passadas (já finalizadas)
                filtered = allReservations.filter(r => {
                    const end = new Date(r.endDate);
                    return r.status === 'CONFIRMED' && now > end;
                });
                break;
            case 'cancelled':
                // Reservas canceladas
                filtered = allReservations.filter(r => r.status === 'CANCELLED');
                break;
            default:
                // Todas
                filtered = allReservations;
        }

        displayReservations(filtered);

        // Atualizar botões ativos
        Object.keys(filterButtons).forEach(key => {
            if (key === filter) {
                filterButtons[key].classList.add('active');
            } else {
                filterButtons[key].classList.remove('active');
            }
        });
    }

    /**
     * Exibe as reservas na tela
     */
    function displayReservations(reservations) {
        if (reservations.length === 0) {
            reservationsList.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        reservationsList.style.display = 'block';
        emptyState.style.display = 'none';
        reservationsList.innerHTML = '';

        reservations.forEach(reservation => {
            const resEl = createReservationElement(reservation);
            reservationsList.appendChild(resEl);
        });
    }

    /**
     * Cria elemento HTML para uma reserva
     */
    function createReservationElement(reservation) {
        const div = document.createElement('div');
        div.className = `reservation-item ${reservation.status.toLowerCase()}`;
        div.dataset.id = reservation.id;

        const startDate = new Date(reservation.startDate).toLocaleDateString('pt-BR');
        const endDate = new Date(reservation.endDate).toLocaleDateString('pt-BR');
        const items = reservation.items.map(item => item.asset.name).join(', ');

        const statusText = {
            'CONFIRMED': 'Confirmada',
            'CANCELLED': 'Cancelada'
        };

        const canCancel = reservation.status === 'CONFIRMED' && new Date(reservation.endDate) >= new Date();

        div.innerHTML = `
      <div class="reservation-header">
        <h3>Reserva #${reservation.id}</h3>
        <span class="status-badge ${reservation.status.toLowerCase()}">${statusText[reservation.status]}</span>
      </div>
      <div class="reservation-details">
        <p><strong>Itens:</strong> ${items}</p>
        <p><strong>Período:</strong> ${startDate} até ${endDate} (${reservation.days} ${reservation.days === 1 ? 'dia' : 'dias'})</p>
      </div>
      ${canCancel ? '<button class="cancel-btn" data-id="' + reservation.id + '">Cancelar Reserva</button>' : ''}
    `;

        // Adicionar listener para cancelar
        if (canCancel) {
            const cancelBtn = div.querySelector('.cancel-btn');
            cancelBtn.addEventListener('click', () => {
                showCancelModal(reservation.id);
            });
        }

        return div;
    }

    /**
     * Mostra modal de confirmação de cancelamento
     */
    function showCancelModal(reservationId) {
        reservationToCancel = reservationId;
        cancelModal.style.display = 'flex';
    }

    /**
     * Fecha modal de cancelamento
     */
    function closeCancelModal() {
        reservationToCancel = null;
        cancelModal.style.display = 'none';
    }

    /**
     * Cancela uma reserva
     */
    async function cancelReservation() {
        if (!reservationToCancel) return;

        try {
            const response = await apiDelete(`/api/reservas/${reservationToCancel}`);

            if (response.success) {
                alert('Reserva cancelada com sucesso!');
                closeCancelModal();
                await loadReservations(); // Recarregar lista
            } else {
                alert('Erro ao cancelar reserva: ' + (response.message || 'Erro desconhecido'));
            }
        } catch (error) {
            console.error('Erro ao cancelar reserva:', error);
            alert('Erro ao cancelar reserva. Tente novamente.');
        }
    }

    // Event listeners para filtros
    Object.keys(filterButtons).forEach(key => {
        filterButtons[key].addEventListener('click', () => applyFilter(key));
    });

    // Event listeners para modal
    confirmCancelBtn.addEventListener('click', cancelReservation);
    closeCancelModalBtn.addEventListener('click', closeCancelModal);

    // Fechar modal ao clicar fora
    cancelModal.addEventListener('click', (e) => {
        if (e.target === cancelModal) {
            closeCancelModal();
        }
    });

    // Carregar reservas ao iniciar
    await loadReservations();
});
