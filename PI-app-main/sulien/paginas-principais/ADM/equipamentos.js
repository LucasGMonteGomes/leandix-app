// ================================
// ELEMENTOS GERAIS
// ================================
const modal = document.getElementById('modalEquipamento');
const form = document.getElementById('formEquipamento');
const equipamentosList = document.getElementById('equipamentos-list');
const tipoSelect = document.getElementById('tipo');
const equipmentFields = document.getElementById('equipmentFields');
const roomFields = document.getElementById('roomFields');
const modalTitle = document.getElementById('modalTitle');

// ================================
// MOSTRAR/OCULTAR CAMPOS DINAMICAMENTE
// ================================
tipoSelect?.addEventListener('change', () => {
    const tipo = tipoSelect.value;

    if (tipo === 'EQUIPMENT') {
        equipmentFields.style.display = 'block';
        roomFields.style.display = 'none';
        // Limpar campos de sala
        document.getElementById('capacity').value = '';
        document.getElementById('roomType').value = '';
        document.getElementById('floor').value = '';
        document.getElementById('resources').value = '';
        document.getElementById('observations').value = '';
    } else if (tipo === 'ROOM') {
        equipmentFields.style.display = 'none';
        roomFields.style.display = 'block';
        // Limpar campos de equipamento
        document.getElementById('serialNumber').value = '';
        document.getElementById('quantity').value = '';
        document.getElementById('condition').value = '';
        document.getElementById('defaultLocation').value = '';
        document.getElementById('description').value = '';
    } else {
        equipmentFields.style.display = 'none';
        roomFields.style.display = 'none';
    }
});

// ================================
// CARREGAR EQUIPAMENTOS E SALAS
// ================================
async function carregarEquipamentos() {
    try {
        const equipamentos = await apiGet('/api/assets');

        equipamentosList.innerHTML = '';

        if (!equipamentos || equipamentos.length === 0) {
            equipamentosList.innerHTML = '<p style="color: #666;">Nenhum equipamento ou sala cadastrado ainda.</p>';
            return;
        }

        equipamentos.forEach(item => {
            const div = document.createElement('div');
            div.className = 'historico-item';
            div.style.display = 'flex';
            div.style.justifyContent = 'space-between';
            div.style.alignItems = 'center';
            div.style.gap = '15px';

            const info = document.createElement('div');
            info.style.flex = '1';

            let detalhes = `
        <div><strong>Nome:</strong> ${item.name}</div>
        <div><strong>Tipo:</strong> ${item.type === 'ROOM' ? '🏫 Sala' : '📦 Equipamento'}</div>
      `;

            if (item.type === 'EQUIPMENT') {
                detalhes += `
          ${item.serialNumber ? `<div><strong>Nº Série:</strong> ${item.serialNumber}</div>` : ''}
          ${item.quantity ? `<div><strong>Quantidade:</strong> ${item.quantity} unidades</div>` : ''}
          ${item.condition ? `<div><strong>Estado:</strong> ${item.condition}</div>` : ''}
          ${item.defaultLocation ? `<div><strong>Localização:</strong> ${item.defaultLocation}</div>` : ''}
        `;
            } else {
                detalhes += `
          ${item.capacity ? `<div><strong>Capacidade:</strong> ${item.capacity} pessoas</div>` : ''}
          ${item.roomType ? `<div><strong>Tipo:</strong> ${item.roomType}</div>` : ''}
          ${item.floor ? `<div><strong>Andar:</strong> ${item.floor}</div>` : ''}
          ${item.resources ? `<div><strong>Recursos:</strong> ${item.resources}</div>` : ''}
        `;
            }

            info.innerHTML = detalhes;

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
            btnDelete.onclick = () => excluirEquipamento(item.id, item.name);

            actions.appendChild(btnEdit);
            actions.appendChild(btnDelete);

            div.appendChild(info);
            div.appendChild(actions);
            equipamentosList.appendChild(div);
        });

    } catch (erro) {
        console.error('Erro ao carregar equipamentos:', erro);
        equipamentosList.innerHTML = '<p style="color: red;">Erro ao carregar. Verifique se o backend está rodando.</p>';
    }
}

// ================================
// MODAL
// ================================
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

    if (item.type === 'EQUIPMENT') {
        equipmentFields.style.display = 'block';
        roomFields.style.display = 'none';
        document.getElementById('serialNumber').value = item.serialNumber || '';
        document.getElementById('quantity').value = item.quantity || '';
        document.getElementById('condition').value = item.condition || '';
        document.getElementById('defaultLocation').value = item.defaultLocation || '';
        document.getElementById('description').value = item.description || '';
    } else {
        equipmentFields.style.display = 'none';
        roomFields.style.display = 'block';
        document.getElementById('capacity').value = item.capacity || '';
        document.getElementById('roomType').value = item.roomType || '';
        document.getElementById('floor').value = item.floor || '';
        document.getElementById('resources').value = item.resources || '';
        document.getElementById('observations').value = item.observations || '';
    }

    modal.classList.remove('hidden');
}

// ================================
// SALVAR (CREATE/UPDATE)
// ================================
form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('equipamentoId').value;
    const nome = document.getElementById('nome').value;
    const tipo = document.getElementById('tipo').value;

    const dados = {
        name: nome,
        type: tipo,
        // Campos de equipamento
        serialNumber: document.getElementById('serialNumber').value || null,
        quantity: document.getElementById('quantity').value ? parseInt(document.getElementById('quantity').value) : null,
        condition: document.getElementById('condition').value || null,
        defaultLocation: document.getElementById('defaultLocation').value || null,
        description: document.getElementById('description').value || null,
        // Campos de sala
        capacity: document.getElementById('capacity').value ? parseInt(document.getElementById('capacity').value) : null,
        roomType: document.getElementById('roomType').value || null,
        floor: document.getElementById('floor').value || null,
        resources: document.getElementById('resources').value || null,
        observations: document.getElementById('observations').value || null
    };

    try {
        let response;
        if (id) {
            // UPDATE
            response = await apiPut(`/api/assets/${id}`, dados);
        } else {
            // CREATE
            response = await apiPost('/api/assets', dados);
        }

        if (response) {
            alert(id ? 'Atualizado com sucesso!' : 'Cadastrado com sucesso!');
            fecharModal();
            carregarEquipamentos();
        } else {
            alert('Erro ao salvar');
        }
    } catch (erro) {
        alert('Falha ao conectar ao servidor');
        console.error('Erro:', erro);
    }
});

// ================================
// EXCLUIR
// ================================
async function excluirEquipamento(id, nome) {
    if (!confirm(`Tem certeza que deseja excluir "${nome}"?`)) {
        return;
    }

    try {
        const response = await apiDelete(`/api/assets/${id}`);

        if (response) {
            alert('Excluído com sucesso!');
            carregarEquipamentos();
        } else {
            alert('Erro ao excluir');
        }
    } catch (erro) {
        alert('Falha ao conectar ao servidor');
        console.error('Erro:', erro);
    }
}

// Fechar modal ao clicar fora
window.addEventListener('mousedown', (e) => {
    if (!modal.classList.contains('hidden') && !document.querySelector('.modal-content').contains(e.target)) {
        fecharModal();
    }
});

// Carregar ao iniciar
document.addEventListener('DOMContentLoaded', carregarEquipamentos);
