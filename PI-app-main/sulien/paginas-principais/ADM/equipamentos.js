const modal = document.getElementById('modalEquipamento');
const form = document.getElementById('formEquipamento');
const equipamentosList = document.getElementById('equipamentos-list');
const tipoSelect = document.getElementById('tipo');
const equipmentFields = document.getElementById('equipmentFields');
const roomFields = document.getElementById('roomFields');
const modalTitle = document.getElementById('modalTitle');

tipoSelect?.addEventListener('change', () => {
  const tipo = tipoSelect.value;
  equipmentFields.style.display = tipo === 'EQUIPMENT' ? 'block' : 'none';
  roomFields.style.display = tipo === 'ROOM' ? 'block' : 'none';
});

async function carregarEquipamentos() {
  try {
    equipamentosList.innerHTML = '<p class="muted">Carregando...</p>';

    const eqResp = await apiGet('/api/equipment.php?action=list');
    const roomResp = await apiGet('/api/rooms.php?action=list');

    const equipamentos = (eqResp && eqResp.equipments) || [];
    const salas = (roomResp && roomResp.rooms) || [];

    const itens = [
      ...equipamentos.map(e => ({
        type: 'EQUIPMENT',
        id: e.id,
        name: e.nome,
        status: e.status || 'disponivel'
      })),
      ...salas.map(s => ({
        type: 'ROOM',
        id: s.id,
        name: s.nome,
        status: s.status || 'disponivel',
        extra: s.capacidade ? `Capacidade: ${s.capacidade}` : ''
      }))
    ];

    equipamentosList.innerHTML = '';
    if (!itens.length) {
      equipamentosList.innerHTML = '<p style="color:#666;">Nenhum equipamento ou sala cadastrado.</p>';
      return;
    }

    itens.forEach(item => {
      const div = document.createElement('div');
      div.className = 'historico-item';
      div.style.display = 'flex';
      div.style.justifyContent = 'space-between';
      div.style.alignItems = 'center';
      div.style.gap = '15px';

      const info = document.createElement('div');
      info.style.flex = '1';
      info.innerHTML = `
        <div><strong>Nome:</strong> ${item.name}</div>
        <div><strong>Tipo:</strong> ${item.type === 'ROOM' ? '🏫 Sala' : '📦 Equipamento'}</div>
        ${item.extra ? `<div>${item.extra}</div>` : ''}
        <div><strong>Status:</strong> ${item.status}</div>
      `;

      const actions = document.createElement('div');
      actions.style.display = 'flex';
      actions.style.gap = '10px';

      const btnEdit = document.createElement('button');
      btnEdit.className = 'btn-confirmar';
      btnEdit.style.padding = '8px 16px';
      btnEdit.innerHTML = '<i class="fa-solid fa-edit"></i> Editar';
      btnEdit.onclick = () => editarEquipamento(item);

      const btnDelete = document.createElement('button');
      btnDelete.className = 'btn-cancelar';
      btnDelete.style.padding = '8px 16px';
      btnDelete.innerHTML = '<i class="fa-solid fa-trash"></i> Excluir';
      btnDelete.onclick = () => excluirEquipamento(item.id, item.name, item.type);

      actions.appendChild(btnEdit);
      actions.appendChild(btnDelete);

      div.appendChild(info);
      div.appendChild(actions);
      equipamentosList.appendChild(div);
    });
  } catch (erro) {
    console.error('Erro ao carregar equipamentos/salas:', erro);
    equipamentosList.innerHTML = '<p style="color:red;">Erro ao carregar. Verifique o backend.</p>';
  }
}

function abrirModal() {
  modalTitle.textContent = 'Adicionar Equipamento/Sala';
  form.reset();
  document.getElementById('equipamentoId').value = '';
  equipmentFields.style.display = 'none';
  roomFields.style.display = 'none';
  modal.classList.remove('hidden');
}

function fecharModal() {
  modal.classList.add('hidden');
}

function editarEquipamento(item) {
  modalTitle.textContent = 'Editar Equipamento/Sala';
  document.getElementById('equipamentoId').value = item.id;
  document.getElementById('nome').value = item.name;
  document.getElementById('tipo').value = item.type;
  equipmentFields.style.display = item.type === 'EQUIPMENT' ? 'block' : 'none';
  roomFields.style.display = item.type === 'ROOM' ? 'block' : 'none';
}

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('equipamentoId').value;
  const nome = document.getElementById('nome').value;
  const tipo = document.getElementById('tipo').value;

  try {
    let response;
    if (tipo === 'EQUIPMENT') {
      const payload = { nome, tipo: 'equipamento', status: 'disponivel' };
      response = id
        ? await apiPut(`/api/equipment.php?action=update&id=${id}`, payload)
        : await apiPost('/api/equipment.php?action=create', payload);
    } else if (tipo === 'ROOM') {
      const capacidade = document.getElementById('capacity').value
        ? parseInt(document.getElementById('capacity').value, 10)
        : null;
      const payload = { nome, capacidade, status: 'disponivel' };
      response = id
        ? await apiPut(`/api/rooms.php?action=update&id=${id}`, payload)
        : await apiPost('/api/rooms.php?action=create', payload);
    } else {
      alert('Selecione o tipo.');
      return;
    }

    if (response) {
      alert('Salvo com sucesso!');
      fecharModal();
      carregarEquipamentos();
    }
  } catch (erro) {
    console.error('Erro ao salvar:', erro);
    alert('Erro ao salvar. Verifique os dados.');
  }
});

async function excluirEquipamento(id, nome, tipo = 'EQUIPMENT') {
  if (!confirm(`Tem certeza que deseja excluir "${nome}"?`)) return;
  try {
    const response = tipo === 'ROOM'
      ? await apiDelete(`/api/rooms.php?action=delete&id=${id}`)
      : await apiDelete(`/api/equipment.php?action=delete&id=${id}`);

    if (response) {
      alert('Excluído com sucesso!');
      carregarEquipamentos();
    }
  } catch (erro) {
    console.error('Erro ao excluir:', erro);
    alert('Falha ao excluir.');
  }
}

window.addEventListener('mousedown', (e) => {
  if (!modal.classList.contains('hidden') && !document.querySelector('.modal-content').contains(e.target)) {
    fecharModal();
  }
});

document.addEventListener('DOMContentLoaded', carregarEquipamentos);
