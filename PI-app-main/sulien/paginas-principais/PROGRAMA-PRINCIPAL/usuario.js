// ================================
// USUARIO.JS - PROGRAMA PRINCIPAL
// ================================

document.addEventListener('DOMContentLoaded', async () => {
  // ================================
  // BOTÕES DE NAVEGAÇÃO
  // ================================
  const navBtns = document.querySelectorAll('.nav-btn');

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelector('.nav-btn.active')?.classList.remove('active');
      btn.classList.add('active');
      console.log("Mudando para:", btn.dataset.route);
    });
  });

  // ================================
  // LOGOUT
  // ================================
  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    logout();
  });

  // ================================
  // CARREGAR DADOS DO USUÁRIO
  // ================================
  const user = getUserData();
  if (user) {
    // Update UI with user data if elements exist
    const nomeEl = document.getElementById('user-nome');
    const turmaEl = document.getElementById('user-turma');
    const salaEl = document.getElementById('user-sala');
    const raEl = document.getElementById('user-ra');
    const emailEl = document.getElementById('user-email');
    const phoneEl = document.getElementById('user-numero');
    const photoEl = document.querySelector('.user-photo');

    if (nomeEl) nomeEl.textContent = user.fullName || user.username;
    if (turmaEl) turmaEl.textContent = user.turma || '-';
    if (salaEl) salaEl.textContent = user.sala || '-';
    if (raEl) raEl.textContent = user.ra || '-';
    if (emailEl) emailEl.textContent = user.email || '-';
    if (phoneEl) phoneEl.textContent = user.phone || '-';
    if (photoEl && user.photoBase64) photoEl.src = user.photoBase64;
  }

  // ================================
  // HISTÓRICO DE RESERVAS
  // ================================
  await carregarHistorico();
});

async function carregarHistorico() {
  const historicoList = document.getElementById('historico-list');
  if (!historicoList) return;

  try {
    const historico = await apiGet('/api/reservas/historico');

    if (!historico || historico.length === 0) {
      historicoList.innerHTML = `
                <div style="padding: 20px; text-align: center; color: var(--muted);">
                    <p>Nenhuma reserva encontrada no histórico.</p>
                </div>
            `;
      return;
    }

    historicoList.innerHTML = "";

    historico.forEach(item => {
      const div = document.createElement('div');
      div.className = 'historico-item';

      const date = new Date(item.startDate).toLocaleDateString('pt-BR');
      const itemsNames = item.items.map(i => i.asset.name).join(', ');
      const statusClass = item.status.toLowerCase();

      div.innerHTML = `
                <div class="hist-date">${date}</div>
                <div class="hist-info">
                    <strong>${itemsNames}</strong>
                    <span class="status-badge ${statusClass}">${item.status}</span>
                </div>
            `;
      historicoList.appendChild(div);
    });

  } catch (erro) {
    console.error("Erro ao carregar histórico:", erro);
    historicoList.innerHTML = `
            <div style="padding: 20px; text-align: center; color: var(--danger);">
                <p>Erro ao carregar histórico.</p>
            </div>
        `;
  }
}
