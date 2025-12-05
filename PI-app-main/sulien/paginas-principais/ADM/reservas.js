/* ======================================================================
   SCRIPT DA PÁGINA DE RESERVAS (ADM)
   ======================================================================*/

// ------------------------------
// VARIÁVEIS DE ESTADO
// ------------------------------
const state = {
  step: 1,
  currentMonth: new Date(),
  selectedStart: null,
  days: 1,
  selectedRooms: [],
  selectedEquipment: [],
};

// ------------------------------
// ELEMENTOS DOM
// ------------------------------
const stepsEl = document.querySelectorAll('#steps .step');
const panels = document.querySelectorAll('.step-panel');
const currentStepEl = document.getElementById('current-step');
const calendarEl = document.getElementById('calendar');
const calendarTitle = document.getElementById('calendar-title');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
const daysCount = document.getElementById('days-count');
const alignBusinessBtn = document.getElementById('align-business');
const roomsList = document.getElementById('rooms-list');
const equipList = document.getElementById('equipment-list');
const summaryEl = document.getElementById('summary');
const backBtn = document.getElementById('backBtn');
const nextBtn = document.getElementById('nextBtn');
const confirmBtn = document.getElementById('confirmBtn');
const skipRoomsBtn = document.getElementById('skip-rooms');
const skipEquipBtn = document.getElementById('skip-equipment');

// ------------------------------
// FUNÇÕES AUXILIARES DE DATA
// ------------------------------
function formatDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDays(d, days) {
  const t = new Date(d.getTime());
  t.setDate(t.getDate() + days);
  return t;
}

function isSunday(d) { return d.getDay() === 0; }
function monthLabel(d) { return d.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }); }

// ------------------------------
// RENDER CALENDÁRIO
// ------------------------------
function renderCalendar() {
  const year = state.currentMonth.getFullYear();
  const month = state.currentMonth.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = firstOfMonth.getDay();
  const days = [];
  const startOffset = -startWeekday;

  for (let i = 0; i < 42; i++) days.push(addDays(firstOfMonth, startOffset + i));

  calendarTitle.textContent = monthLabel(state.currentMonth);
  calendarEl.innerHTML = '';

  const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  weekdays.forEach(w => {
    const el = document.createElement('div');
    el.className = 'weekday';
    el.style.textAlign = 'center';
    el.textContent = w;
    calendarEl.appendChild(el);
  });

  days.forEach(d => {
    const el = document.createElement('div');
    el.className = 'day';
    if (isSunday(d)) el.classList.add('disabled');

    const numero = document.createElement('div');
    numero.className = 'date';
    numero.textContent = d.getDate();

    if (d.getMonth() !== month) el.style.opacity = '0.55';
    el.appendChild(numero);

    el.addEventListener('click', () => {
      if (isSunday(d)) return;
      state.selectedStart = d;
      renderSelectionRange();
      refreshCalendarSelection();
    });

    calendarEl.appendChild(el);
  });

  refreshCalendarSelection();
}

function refreshCalendarSelection() {
  const dayEls = Array.from(calendarEl.querySelectorAll('.day'));
  if (!state.selectedStart) {
    dayEls.forEach(el => el.classList.remove('selected', 'range'));
    return;
  }

  const totalDays = state.days;
  const start = new Date(state.selectedStart);
  const end = addDays(start, totalDays - 1);

  const cells = dayEls;

  cells.forEach((el, i) => {
    const year = state.currentMonth.getFullYear();
    const month = state.currentMonth.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const startWeekday = firstOfMonth.getDay();
    const gridStart = addDays(firstOfMonth, -startWeekday);
    const thisDate = addDays(gridStart, i);

    el.classList.remove('selected', 'range');

    if (formatDate(thisDate) === formatDate(start))
      el.classList.add('selected');

    if (thisDate >= start && thisDate <= end)
      el.classList.add('range');
  });
}

function renderSelectionRange() {
  state.days = parseInt(daysCount.value, 10);
  refreshCalendarSelection();
}

// ------------------------------
// NAVEGAÇÃO ENTRE ETAPAS
// ------------------------------
function gotoStep(n) {
  state.step = n;
  currentStepEl.textContent = n;

  stepsEl.forEach(s => s.classList.toggle('active', parseInt(s.dataset.step, 10) === n));
  panels.forEach(p => p.style.display = parseInt(p.dataset.panel, 10) === n ? 'block' : 'none');

  backBtn.style.display = n === 1 ? 'none' : 'inline-block';
  nextBtn.style.display = n === 4 ? 'none' : 'inline-block';
  confirmBtn.style.display = n === 4 ? 'inline-block' : 'none';

  if (n === 2) loadRoomsForSelectedPeriod();
  if (n === 3) loadEquipmentForSelectedPeriod();
  if (n === 4) buildSummary();
}

backBtn.addEventListener('click', () => { if (state.step > 1) gotoStep(state.step - 1); });

nextBtn.addEventListener('click', () => {
  if (state.step === 1 && !state.selectedStart) {
    alert('Selecione a data de início.');
    return;
  }
  gotoStep(state.step + 1);
});

// ------------------------------
// CONFIRMAÇÃO
// ------------------------------
confirmBtn.addEventListener('click', async () => {
  const userData = getUserData();
  if (!userData) {
    alert('Sessão expirada. Faça login novamente.');
    window.location.href = '../../index.html';
    return;
  }

  const payload = {
    userId: userData.id || userData.user.id, // Handle both structures
    start: formatDate(state.selectedStart),
    days: state.days,
    rooms: state.selectedRooms,
    equipments: state.selectedEquipment,
    notes: document.getElementById('obs').value || ''
  };

  try {
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Verificando...';

    const data = await apiPost('/api/reservas', payload);

    if (data.success) {
      alert('Reserva confirmada!');
      window.location.reload();
    } else {
      alert('Não foi possível reservar: ' + (data.message || 'Itens indisponíveis.'));
    }

  } catch (err) {
    console.error(err);
    alert('Erro ao processar reserva: ' + err.message);
  } finally {
    confirmBtn.disabled = false;
    confirmBtn.textContent = 'Confirmar Reserva';
  }
});

// ------------------------------
// CARREGAR SALAS / EQUIPAMENTOS
// ------------------------------
async function loadRoomsForSelectedPeriod() {
  if (!state.selectedStart) {
    roomsList.innerHTML = '<div class="muted">Escolha primeiro uma data.</div>';
    return;
  }

  roomsList.innerHTML = '<div class="muted">Carregando salas...</div>';

  try {
    const resp = await apiGet('/api/rooms.php?action=list');
    const data = (resp && resp.rooms) || [];
    renderRooms(data);
  } catch (err) {
    console.error(err);
    roomsList.innerHTML = '<div class="muted">Erro ao carregar salas.</div>';
  }
}

function renderRooms(dados) {
  roomsList.innerHTML = '';
  if (!dados.length) {
    roomsList.innerHTML = '<div class="muted">Nenhuma sala disponível.</div>';
    return;
  }

  dados.forEach(room => {
    const el = document.createElement('div');
    el.className = 'item';

    el.innerHTML = `
      <div class="meta">
        <strong>${room.name}</strong>
        <span class="muted">Capacidade: ${room.capacity}</span>
      </div>
    `;

    const btn = document.createElement('button');
    btn.textContent = state.selectedRooms.includes(room.id) ? 'Remover' : 'Selecionar';

    btn.addEventListener('click', () => {
      const idx = state.selectedRooms.indexOf(room.id);
      if (idx >= 0) state.selectedRooms.splice(idx, 1);
      else state.selectedRooms.push(room.id);
      renderRooms(dados);
    });

    el.appendChild(btn);
    roomsList.appendChild(el);
  });
}

skipRoomsBtn.addEventListener('click', () => {
  state.selectedRooms = [];
  gotoStep(3);
});

async function loadEquipmentForSelectedPeriod() {
  if (!state.selectedStart) {
    equipList.innerHTML = '<div class="muted">Escolha primeiro uma data.</div>';
    return;
  }

  equipList.innerHTML = '<div class="muted">Carregando equipamentos...</div>';

  try {
    const resp = await apiGet('/api/equipment.php?action=list');
    const data = (resp && resp.equipments) || [];
    renderEquipment(data);
  } catch (err) {
    console.error(err);
    equipList.innerHTML = '<div class="muted">Erro ao carregar equipamentos.</div>';
  }
}

function renderEquipment(dados) {
  equipList.innerHTML = '';
  if (!dados.length) {
    equipList.innerHTML = '<div class="muted">Nenhum equipamento disponível.</div>';
    return;
  }

  dados.forEach(eq => {
    const el = document.createElement('div');
    el.className = 'item';

    el.innerHTML = `
      <div class="meta">
        <strong>${eq.name}</strong>
        <span class="muted">Disponível: ${eq.quantity || eq.qtyAvailable}</span>
      </div>
    `;

    const btn = document.createElement('button');
    btn.textContent = state.selectedEquipment.includes(eq.id) ? 'Remover' : 'Selecionar';

    btn.addEventListener('click', () => {
      const idx = state.selectedEquipment.indexOf(eq.id);
      if (idx >= 0) state.selectedEquipment.splice(idx, 1);
      else state.selectedEquipment.push(eq.id);
      renderEquipment(dados);
    });

    el.appendChild(btn);
    equipList.appendChild(el);
  });
}

skipEquipBtn.addEventListener('click', () => {
  state.selectedEquipment = [];
  gotoStep(4);
});

// ------------------------------
// RESUMO
// ------------------------------
function buildSummary() {
  summaryEl.innerHTML = '';

  const days = state.days;
  const start = state.selectedStart ? formatDate(state.selectedStart) : '—';
  const end = state.selectedStart ? formatDate(addDays(state.selectedStart, days - 1)) : '—';

  const periodRow = document.createElement('div');
  periodRow.className = 'row';
  periodRow.innerHTML = `<div>Período</div><div>${start} → ${end} (${days} dias)</div>`;
  summaryEl.appendChild(periodRow);

  const roomsRow = document.createElement('div');
  roomsRow.className = 'row';
  roomsRow.innerHTML = state.selectedRooms.length
    ? `<div>Salas</div><div>${state.selectedRooms.join(', ')}</div>`
    : `<div>Salas</div><div class="muted">Nenhuma sala selecionada</div>`;
  summaryEl.appendChild(roomsRow);

  const equipRow = document.createElement('div');
  equipRow.className = 'row';
  equipRow.innerHTML = state.selectedEquipment.length
    ? `<div>Equipamentos</div><div>${state.selectedEquipment.join(', ')}</div>`
    : `<div>Equipamentos</div><div class="muted">Nenhum equipamento selecionado</div>`;
  summaryEl.appendChild(equipRow);
}

// ------------------------------
// EVENTOS CALENDÁRIO
// ------------------------------
prevMonthBtn.addEventListener('click', () => {
  state.currentMonth = new Date(
    state.currentMonth.getFullYear(),
    state.currentMonth.getMonth() - 1,
    1
  );
  renderCalendar();
});

nextMonthBtn.addEventListener('click', () => {
  state.currentMonth = new Date(
    state.currentMonth.getFullYear(),
    state.currentMonth.getMonth() + 1,
    1
  );
  renderCalendar();
});

daysCount.addEventListener('change', () => {
  state.days = parseInt(daysCount.value, 10);
  renderSelectionRange();
  refreshCalendarSelection();
});

alignBusinessBtn.addEventListener('click', () => {
  if (!state.selectedStart) {
    alert('Selecione primeiro uma data.');
    return;
  }
  const s = state.selectedStart;
  const day = s.getDay();
  const daysToNextMonday = (8 - day) % 7;
  state.selectedStart = addDays(s, daysToNextMonday);

  if (isSunday(state.selectedStart)) {
    alert('Não é possível alinhar para domingo.');
    return;
  }

  renderSelectionRange();
  refreshCalendarSelection();
});

// ------------------------------
// INICIALIZAÇÃO
// ------------------------------
document.addEventListener('DOMContentLoaded', () => {
  // Check auth
  if (!isUserLoggedIn()) {
    window.location.href = '../../index.html';
    return;
  }

  renderCalendar();
  backBtn.style.display = 'none';

  const userData = getUserData();
  if (userData) {
    // Handle both structure types (direct or nested user)
    const name = userData.fullName || (userData.user && userData.user.fullName) || 'Usuário';
    const nameEl = document.getElementById('user-name');
    if (nameEl) nameEl.textContent = name;
  }
});
