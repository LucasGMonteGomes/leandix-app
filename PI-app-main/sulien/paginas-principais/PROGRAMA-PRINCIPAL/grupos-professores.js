document.addEventListener('DOMContentLoaded', async () => {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const groupsContainer = document.getElementById('groupsContainer');
    let currentShift = 'MORNING';

    // Event listeners para tabs
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentShift = btn.dataset.shift;
            loadGroups(currentShift);
        });
    });

    // Carregar grupos
    async function loadGroups(shift) {
        try {
            const professors = await apiGet(`/api/usuarios/professores?shift=${shift}`);

            if (!professors || professors.length === 0) {
                groupsContainer.innerHTML = '<p>Nenhum professor cadastrado neste turno.</p>';
                return;
            }

            // Agrupar professores
            const groups = {};
            professors.forEach(prof => {
                const group = prof.rotationGroup || 'Sem Grupo';
                if (!groups[group]) {
                    groups[group] = [];
                }
                groups[group].push(prof);
            });

            // Renderizar grupos
            groupsContainer.innerHTML = '';
            Object.keys(groups).sort().forEach(groupName => {
                const groupCard = document.createElement('div');
                groupCard.className = 'group-card';

                const header = document.createElement('div');
                header.className = 'group-header';
                header.textContent = `Grupo ${groupName}`;
                groupCard.appendChild(header);

                const count = document.createElement('p');
                count.textContent = `${groups[groupName].length} professor(es)`;
                count.style.color = '#666';
                count.style.fontSize = '14px';
                groupCard.appendChild(count);

                groups[groupName].forEach(prof => {
                    const profItem = document.createElement('div');
                    profItem.className = 'professor-item';
                    profItem.innerHTML = `
            <strong>${prof.fullName || prof.username}</strong><br>
            <small>${prof.email}</small><br>
            <small>Reservas esta semana: ${prof.labReservationsThisWeek || 0} labs, ${prof.notebookReservationsThisWeek || 0} notebooks</small>
          `;
                    groupCard.appendChild(profItem);
                });

                groupsContainer.appendChild(groupCard);
            });

        } catch (error) {
            console.error('Erro ao carregar grupos:', error);
            groupsContainer.innerHTML = '<p class="error">Erro ao carregar grupos de professores.</p>';
        }
    }

    // Carregar grupos iniciais
    await loadGroups(currentShift);
});
