document.addEventListener('DOMContentLoaded', () => {

  const loader = document.getElementById('loader');
  const app = document.getElementById('app');
  const monthYear = document.getElementById('monthYear');
  const datesEl = document.getElementById('dates');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const miniMonth = document.getElementById('miniMonth');
  const miniDates = document.getElementById('miniDates');
  const miniPrev = document.getElementById('miniPrev');
  const miniNext = document.getElementById('miniNext');

  const userNome = document.getElementById('userNome');
  const userTurma = document.getElementById('userTurma');
  const userSala = document.getElementById('userSala');
  const userFoto = document.getElementById('userFoto');
  const userFotoCard = document.getElementById('userFotoCard');
  const userNomeShort = document.getElementById('userNomeShort');
  const userEmprestados = document.getElementById('userEmprestados');
  const userReservas = document.getElementById('userReservas');
  const userLimite = document.getElementById('userLimite');

  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modalTitle');
  const modalMsg = document.getElementById('modalMsg');
  const modalCancel = document.getElementById('modalCancel');
  const modalConfirm = document.getElementById('modalConfirm');

  let currentDate = new Date();
  let reservasCache = [];
  let usuario = { id: 1 };
  let selectedDay = null;

  setTimeout(() => {
    loader.style.opacity = 0;
    setTimeout(() => {
      loader.style.display = 'none';
      app.removeAttribute('aria-hidden');
    }, 300);
  }, 1000);

  async function fetchJSON(url, opts) {
    // Mantendo fetchJSON para compatibilidade se usado em outros lugares, mas carregarUsuario usará apiGet
    try {
      const r = await fetch(url, opts);
      if (!r.ok) throw new Error(r.status);
      return await r.json();
    } catch (e) {
      console.warn('fetch fail', url, e);
      return null;
    }
  }

  async function carregarUsuario() {
    try {
      // Usando apiGet do api-config.js
      const dados = await apiGet('/api/usuarios/me');

      if (!dados) {
        throw new Error('Dados vazios');
      }

      usuario = dados;
      // Mapeando campos do backend (User.java) para o frontend
      userNome.textContent = dados.username || 'Usuário';
      userNomeShort.textContent = (dados.username || 'Usuário').split(' ')[0];

      // Campos que ainda não existem no backend, mantendo padrão ou placeholder
      userTurma.textContent = dados.turma || '—';
      userSala.textContent = dados.sala || '—';

      if (dados.photoBase64) {
        userFoto.src = dados.photoBase64;
        userFotoCard.src = dados.photoBase64;
      } else {
        // Se não tiver foto, usa placeholder
        userFoto.src = 'img/avatar-placeholder.png';
        userFotoCard.src = 'img/avatar-placeholder.png';
      }

      userEmprestados.textContent = dados.emprestados ?? 0;
      userReservas.textContent = dados.reservas ?? 0;
      userLimite.textContent = dados.limite ?? 5;

    } catch (error) {
      console.warn('Erro ao carregar usuário do backend, usando fallback:', error);

      usuario = { id: 1 };
      userNome.textContent = 'Usuário Offline';
      userNomeShort.textContent = 'Offline';
      userTurma.textContent = '—';
      userSala.textContent = '—';
      userFoto.src = 'img/avatar-placeholder.png';
      userFotoCard.src = 'img/avatar-placeholder.png';
      userEmprestados.textContent = '-';
      userReservas.textContent = '-';
      userLimite.textContent = '-';
    }
  }

  async function carregarReservas(mes, ano) {
    try {
      mes = Number(mes);
      ano = Number(ano);

      // Buscar reservas do backend usando apiGet
      const reservations = await apiGet(`/api/reservas?mes=${mes}&ano=${ano}`);

      if (!reservations || !Array.isArray(reservations)) {
        reservasCache = [];
        return reservasCache;
      }

      // Transformar dados do backend para o formato esperado pelo frontend
      reservasCache = [];
      reservations.forEach(reservation => {
        // Para cada reserva, criar entradas para cada dia do período
        const startDate = new Date(reservation.startDate);
        const endDate = new Date(reservation.endDate);

        // Iterar sobre cada dia da reserva
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
          if (d.getMonth() + 1 === mes && d.getFullYear() === ano) {
            // Para cada item (sala ou equipamento) na reserva
            reservation.items.forEach(item => {
              reservasCache.push({
                dia: d.getDate(),
                mes: mes,
                ano: ano,
                equipamentoNome: item.asset.name,
                status: reservation.status === 'CONFIRMED' ? 'sua' : 'cancelada',
                reservationId: reservation.id,
                startDate: reservation.startDate,
                endDate: reservation.endDate
              });
            });
          }
        }
      });

      return reservasCache;
    } catch (error) {
      console.warn('Erro ao carregar reservas:', error);
      reservasCache = [];
      return reservasCache;
    }
  }

  async function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    monthYear.textContent = currentDate.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
    miniMonth.textContent = currentDate.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
    await carregarReservas(month + 1, year);
    datesEl.innerHTML = '';
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement('div');
      empty.className = 'date empty';
      datesEl.appendChild(empty);
    }
    for (let d = 1; d <= lastDate; d++) {
      const div = document.createElement('div');
      div.className = 'date';
      div.tabIndex = 0;
      div.textContent = d;
      const today = new Date();
      if (d === today.getDate() && month === today.getMonth() && year === today.getFullYear()) div.classList.add('today');
      const diaReservas = reservasCache.filter(r => Number(r.dia) === d);
      if (diaReservas.length > 0) {
        const sua = diaReservas.find(rr => rr.status === 'sua');
        if (sua) div.classList.add('yours');
        else div.classList.add('unavailable');
        const dot = document.createElement('span');
        dot.className = 'dot';
        div.appendChild(dot);
        div.title = diaReservas.map(rr => `${rr.equipamentoNome || 'Equip'} (${rr.status})`).join('\n');
      }
      if (selectedDay && selectedDay.dia === d && selectedDay.mes === month + 1 && selectedDay.ano === year) div.classList.add('selected');
      div.addEventListener('click', () => {
        selectDay(d, month + 1, year);
        abrirModal('Ações do dia', `Dia ${d} — O que deseja fazer?`, async () => { });
      });
      datesEl.appendChild(div);
    }
    renderMiniCalendar(month, year);
  }

  function renderMiniCalendar(month, year) {
    miniDates.innerHTML = '';
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    for (let i = 0; i < firstDay; i++) {
      const e = document.createElement('div');
      e.className = 'mdate empty';
      miniDates.appendChild(e);
    }
    for (let d = 1; d <= lastDate; d++) {
      const m = document.createElement('div');
      m.className = 'mdate';
      m.textContent = d;
      m.tabIndex = 0;
      const today = new Date();
      if (d === today.getDate() && month === today.getMonth() && year === today.getFullYear()) m.classList.add('today');
      const some = reservasCache.find(r => Number(r.dia) === d);
      if (some) {
        m.classList.add('has');
        const badge = document.createElement('span');
        badge.className = 'badge';
        m.appendChild(badge);
      }
      if (selectedDay && selectedDay.dia === d && selectedDay.mes === month + 1 && selectedDay.ano === year) m.classList.add('selected');
      m.addEventListener('click', () => {
        selectDay(d, month + 1, year);
        const mainCal = document.getElementById('mainCalendar');
        if (mainCal) mainCal.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      miniDates.appendChild(m);
    }
  }

  function selectDay(dia, mes, ano) {
    selectedDay = { dia: Number(dia), mes: Number(mes), ano: Number(ano) };
    renderCalendar();
  }

  function abrirModal(title, msg, onConfirm) {
    modalTitle.innerHTML = title;
    modalMsg.innerHTML = msg;
    modal.classList.remove('hidden');
    function fechar() {
      modal.classList.add('hidden');
      modalConfirm.removeEventListener('click', confirmHandler);
      modalCancel.removeEventListener('click', cancelHandler);
    }
    function confirmHandler() { fechar(); onConfirm && onConfirm(); }
    function cancelHandler() { fechar(); }
    modalConfirm.addEventListener('click', confirmHandler);
    modalCancel.addEventListener('click', cancelHandler);
  }

  prevBtn.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); });
  nextBtn.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); });
  miniPrev.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); });
  miniNext.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); });

  (async function init() {
    await carregarUsuario();
    await renderCalendar();
  })();

});

document.addEventListener("DOMContentLoaded", () => {
  const temaSalvo = localStorage.getItem("tema");
  if (temaSalvo === "Escuro") document.documentElement.classList.add("dark-theme");
});

document.addEventListener("DOMContentLoaded", () => {
  const idioma = localStorage.getItem("idioma") || "pt";
  carregarIdioma(idioma);
});
