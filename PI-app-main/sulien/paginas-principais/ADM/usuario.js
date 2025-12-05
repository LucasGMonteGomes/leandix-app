document.addEventListener('DOMContentLoaded', () => {
  const areaSelect = document.getElementById('Area');
  const turnoGroup = document.getElementById('turnoGroup');
  const turnoSelect = document.getElementById('turno');
  const formCadastro = document.getElementById('formCadastro');
  const cpfInput = document.getElementById('cpf');
  const telefoneInput = document.getElementById('telefone');

  if (areaSelect && turnoGroup && turnoSelect) {
    areaSelect.addEventListener('change', () => {
      if (areaSelect.value === 'professor') {
        turnoGroup.style.display = 'block';
        turnoSelect.required = true;
      } else {
        turnoGroup.style.display = 'none';
        turnoSelect.required = false;
        turnoSelect.value = '';
      }
    });
  }

  if (cpfInput) {
    cpfInput.addEventListener('input', e => {
      const digits = e.target.value.replace(/\D/g, '').slice(0, 11);
      let out = digits;
      if (digits.length > 9) out = digits.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
      else if (digits.length > 6) out = digits.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
      else if (digits.length > 3) out = digits.replace(/(\d{3})(\d{1,3})/, '$1.$2');
      e.target.value = out;
    });
  }

  if (telefoneInput) {
    telefoneInput.addEventListener('input', e => {
      const digits = e.target.value.replace(/\D/g, '').slice(0, 11);
      let out = digits;
      if (digits.length > 6) out = digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      else if (digits.length > 2) out = digits.replace(/(\d{2})(\d{1,5})/, '($1) $2');
      e.target.value = out;
    });
  }

  if (formCadastro) {
    formCadastro.addEventListener('submit', async e => {
      e.preventDefault();

      const nome = (document.getElementById('nome')?.value || '').trim();
      const cpf = (cpfInput?.value || '').replace(/\D/g, '');
      const email = (document.getElementById('email')?.value || '').trim();
      const ra = (document.getElementById('ra')?.value || '').trim();
      const tipo = areaSelect?.value || '';
      const turno = tipo === 'professor' ? (turnoSelect?.value || '') : null;
      const telefone = (telefoneInput?.value || '').replace(/\D/g, '');

      if (nome.length < 3) return alert('Informe o nome completo.');
      if (!validarCPF(cpf)) return alert('CPF inválido.');
      if (!email.includes('@')) return alert('E-mail inválido.');
      if (!ra) return alert('Informe o RA.');
      if (tipo !== 'administrador' && tipo !== 'professor') return alert('Selecione a área.');
      if (tipo === 'professor' && !turno) return alert('Selecione o turno.');
      if (telefone.length < 10) return alert('Telefone inválido.');

      let foto = null;
      const file = document.getElementById('foto')?.files?.[0];
      if (file) foto = await toBase64(file);

      try {
        await createUser({ nome, cpf, ra, tipo, turno, foto });
        alert('Usuário cadastrado com sucesso!');
        formCadastro.reset();
        if (turnoGroup) turnoGroup.style.display = 'none';
        fecharCatalogo();
      } catch (err) {
        alert(`Erro ao cadastrar: ${err.message}`);
      }
    });
  }
});

function validarCPF(value) {
  const cpf = String(value || '').replace(/\D/g, '');
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  const calc = count => {
    let sum = 0;
    for (let i = 0; i < count; i++) sum += parseInt(cpf.charAt(i), 10) * (count + 1 - i);
    const mod = (sum * 10) % 11;
    return mod === 10 ? 0 : mod;
  };
  return calc(9) === parseInt(cpf.charAt(9), 10) && calc(10) === parseInt(cpf.charAt(10), 10);
}

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function abrirCatalogo() {
  const modal = document.getElementById('catalogoAdd');
  if (modal) modal.classList.remove('hidden');
}

function fecharCatalogo() {
  const modal = document.getElementById('catalogoAdd');
  if (modal) {
    modal.classList.add('hidden');
    modal.querySelector('form')?.reset();
    const turnoGroup = document.getElementById('turnoGroup');
    if (turnoGroup) turnoGroup.style.display = 'none';
  }
}

const modalEquip = document.getElementById('catalogoEquipamento');

function abrirEquipamento() {
  if (modalEquip) modalEquip.classList.remove('hidden');
}

function fecharEquipamento() {
  if (modalEquip) modalEquip.classList.add('hidden');
}

const inputFoto = document.getElementById('equip-foto');
const preview = document.getElementById('previewEquip');

if (inputFoto && preview) {
  inputFoto.addEventListener('change', () => {
    const file = inputFoto.files[0];
    if (!file) return;
    preview.src = URL.createObjectURL(file);
    preview.style.display = 'block';
  });
}

const formEquip = document.getElementById('formEquipamento');

if (formEquip) {
  formEquip.addEventListener('submit', async e => {
    e.preventDefault();

    const nomeBase = (document.getElementById('equip-nome')?.value || '').trim();
    const identificacao = (document.getElementById('equip-id')?.value || '').trim();
    const mec = (document.getElementById('equip-mec')?.value || '').trim();
    const tipo = (document.getElementById('equip-tipo')?.value || '').trim().toLowerCase();
    const file = inputFoto?.files?.[0];

    if (!nomeBase || !tipo) return alert('Preencha nome e tipo do equipamento.');

    let foto = null;
    if (file) foto = await toBase64(file);

    const nome = [nomeBase, identificacao, mec].filter(Boolean).join(' | ');

    try {
      await createEquipment({ nome, tipo, status: 'disponivel', foto });
      alert('Equipamento cadastrado com sucesso!');
      formEquip.reset();
      if (preview) preview.style.display = 'none';
      fecharEquipamento();
    } catch (err) {
      alert(`Erro ao cadastrar equipamento: ${err.message}`);
    }
  });
}
