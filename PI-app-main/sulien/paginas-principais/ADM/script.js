document.addEventListener('DOMContentLoaded', () => {

  const loader = document.getElementById('loader');
  const app = document.getElementById('app');
  const monthYear = document.getElementById('monthYear');
  const datesEl = document.getElementById('dates');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

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

  setTimeout(()=>{
    loader.style.opacity = 0;
    setTimeout(()=>{
      loader.style.display = 'none';
      app.removeAttribute('aria-hidden');
    }, 300);
  }, 1000);

  const API = window.API_BASE_URL || '';

  async function apiFetch(path, opts = {}) {
    const resp = await fetch(`${API}${path}`, {
      credentials: 'include',
      ...opts
    });
    if (!resp.ok) throw new Error(resp.status);
    return await resp.json();
  }

  async function carregarUsuario(){
    try {
      const resp = await apiFetch('/api/profile.php?action=get');
      const dados = resp && resp.user ? resp.user : null;
      if (!dados) throw new Error('sem dados');
      usuario = dados;
      userNome.textContent = dados.nome || 'Usuário';
      userNomeShort.textContent = (dados.nome||'Usuário').split(' ')[0];
      userTurma.textContent = dados.turno || '3ºADS';
      userSala.textContent = dados.ra || 'Lab 02';
      if(dados.foto){
        userFoto.src = dados.foto;
        userFotoCard.src = dados.foto;
      }
      userEmprestados.textContent = 0;
      userReservas.textContent = 0;
      userLimite.textContent = 5;
    } catch(e){
      usuario = { id:1 };
      userNome.textContent = 'Gabriel Silva';
      userNomeShort.textContent = 'Gabriel';
      userTurma.textContent = '3ºADS';
      userSala.textContent = 'Lab 02';
      userFoto.src = 'img/avatar-placeholder.png';
      userFotoCard.src = 'img/avatar-placeholder.png';
      userEmprestados.textContent = 0;
      userReservas.textContent = 0;
      userLimite.textContent = 5;
    }
  }

  async function carregarReservas(mes,ano){
    try {
      const r = await apiFetch('/api/reservations.php?action=list');
      const list = (r && r.reservations) || [];
      reservasCache = list.map(item => {
        const d = new Date(item.data_inicio.replace(' ', 'T'));
        return { dia: d.getDate(), mes: d.getMonth() + 1, ano: d.getFullYear(), status: item.status };
      });
    } catch (e) {
      reservasCache = [];
    }
    return reservasCache;
  }

  async function renderCalendar(){
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    monthYear.textContent = currentDate.toLocaleDateString('pt-BR',{month:'short', year:'numeric'});
    await carregarReservas(month+1,year);
    datesEl.innerHTML = '';
    const firstDay = new Date(year,month,1).getDay();
    const lastDate = new Date(year,month+1,0).getDate();
    for(let i=0;i<firstDay;i++){
      const empty = document.createElement('div');
      empty.className='date empty';
      datesEl.appendChild(empty);
    }
    for(let d=1; d<=lastDate; d++){
      const div = document.createElement('div');
      div.className='date';
      div.tabIndex = 0;
      div.textContent = d;
      const today = new Date();
      if(d === today.getDate() && month === today.getMonth() && year === today.getFullYear()) div.classList.add('today');
      const diaReservas = reservasCache.filter(r => Number(r.dia) === d);
      if(diaReservas.length>0){
        const sua = diaReservas.find(rr=> rr.status === 'sua');
        if(sua) div.classList.add('yours');
        else div.classList.add('unavailable');
        const dot = document.createElement('span');
        dot.className='dot';
        div.appendChild(dot);
        div.title = diaReservas.map(rr => `${rr.equipamentoNome || 'Equip'} (${rr.status})`).join('\n');
      }
      if(selectedDay && selectedDay.dia === d && selectedDay.mes === month+1 && selectedDay.ano === year) div.classList.add('selected');
      div.addEventListener('click', ()=>{
        selectDay(d, month+1, year);
        abrirModal('Ações do dia', `Dia ${d} — O que deseja fazer?`, async ()=>{});
      });
      datesEl.appendChild(div);
    }
  }

  function selectDay(dia,mes,ano){
    selectedDay = { dia:Number(dia), mes:Number(mes), ano:Number(ano) };
    renderCalendar();
  }

  function abrirModal(title,msg,onConfirm){
    modalTitle.innerHTML = title;
    modalMsg.innerHTML = msg;
    modal.classList.remove('hidden');
    function fechar(){
      modal.classList.add('hidden');
      modalConfirm.removeEventListener('click',confirmHandler);
      modalCancel.removeEventListener('click',cancelHandler);
    }
    function confirmHandler(){ fechar(); onConfirm && onConfirm(); }
    function cancelHandler(){ fechar(); }
    modalConfirm.addEventListener('click', confirmHandler);
    modalCancel.addEventListener('click', cancelHandler);
  }

  prevBtn.addEventListener('click', ()=>{ currentDate.setMonth(currentDate.getMonth()-1); renderCalendar(); });
  nextBtn.addEventListener('click', ()=>{ currentDate.setMonth(currentDate.getMonth()+1); renderCalendar(); });

  (async function init(){
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
