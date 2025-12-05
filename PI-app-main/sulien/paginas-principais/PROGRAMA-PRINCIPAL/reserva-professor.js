document.addEventListener('DOMContentLoaded', async () => {
    const reservationType = document.getElementById('reservationType');
    const roomGroup = document.getElementById('roomGroup');
    const notebookGroup = document.getElementById('notebookGroup');
    const reservationForm = document.getElementById('reservationForm');
    const startDateInput = document.getElementById('startDate');

    // Definir data mínima (amanhã - 24h de antecedência)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    startDateInput.min = tomorrow.toISOString().split('T')[0];

    // Carregar dados do usuário e quotas
    await loadUserQuotas();

    // Carregar salas disponíveis
    await loadRooms();

    // Mostrar/ocultar campos baseado no tipo
    reservationType.addEventListener('change', () => {
        if (reservationType.value === 'LAB') {
            roomGroup.style.display = 'block';
            document.getElementById('roomSelect').required = true;
            notebookGroup.style.display = 'none';
            document.getElementById('notebookQuantity').required = false;
        } else if (reservationType.value === 'NOTEBOOK') {
            roomGroup.style.display = 'none';
            document.getElementById('roomSelect').required = false;
            notebookGroup.style.display = 'block';
            document.getElementById('notebookQuantity').required = true;
        } else {
            roomGroup.style.display = 'none';
            notebookGroup.style.display = 'none';
        }
    });

    // Submit
    reservationForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const data = {
            start: document.getElementById('startDate').value,
            days: parseInt(document.getElementById('days').value)
        };

        if (reservationType.value === 'LAB') {
            data.rooms = [parseInt(document.getElementById('roomSelect').value)];
        } else if (reservationType.value === 'NOTEBOOK') {
            data.notebookQuantity = parseInt(document.getElementById('notebookQuantity').value);
        }

        try {
            const result = await apiPost('/api/reservas', data);

            if (result.success) {
                alert('Reserva confirmada com sucesso!');
                window.location.href = 'historico.html';
            } else {
                alert('Erro: ' + result.message);
            }
        } catch (error) {
            console.error('Erro ao criar reserva:', error);
            alert('Erro ao criar reserva: ' + error.message);
        }
    });
});

async function loadUserQuotas() {
    try {
        const user = await apiGet('/api/usuarios/me');

        document.getElementById('labQuota').textContent =
            `${user.labReservationsThisWeek || 0}/1`;

        const maxNotebook = user.hasLabThisWeek ? 2 : 3;
        document.getElementById('notebookQuota').textContent =
            `${user.notebookReservationsThisWeek || 0}/${maxNotebook}`;

        if (user.hasLabThisWeek) {
            document.getElementById('quotaNote').textContent =
                '📌 Você já reservou laboratório esta semana (2 reservas de notebooks disponíveis)';
        }
    } catch (error) {
        console.error('Erro ao carregar quotas:', error);
    }
}

async function loadRooms() {
    try {
        const rooms = await apiGet('/api/assets/rooms');
        const select = document.getElementById('roomSelect');

        select.innerHTML = '<option value="">Selecione...</option>';
        rooms.forEach(room => {
            const option = document.createElement('option');
            option.value = room.id;
            option.textContent = `${room.name} - Capacidade: ${room.capacity || 'N/A'}`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar salas:', error);
    }
}
