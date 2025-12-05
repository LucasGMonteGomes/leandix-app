// cadastro-validations.js
document.addEventListener("DOMContentLoaded", () => {
  // --- Seleções seguras ---
  const form = document.getElementById("formCadastro");
  const nome = document.getElementById("nome");
  const email = document.getElementById("email");
  const ra = document.getElementById("ra");
  const cpf = document.getElementById("cpf");
  const area = document.getElementById("area");
  const telefone = document.getElementById("telefone");

  if (!form) {
    console.error("formCadastro não encontrado no DOM. Verifique o id do form.");
    return;
  }

  // --- Endpoints: ajuste para sua API real ---
  const ENDPOINT_CADASTRO = "/api/users/create"; // <- troque pela sua rota real

  // --- Regex (trim antes de testar) ---
  const regexNome  = /^[A-Za-zÀ-ÖØ-öø-ÿ'\- ]{3,}$/;
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const regexRA    = /^\d{3,20}$/;
  const regexTel   = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;

  // --- Helpers ---
  const onlyDigits = s => String(s||"").replace(/\D/g,"");

  function showFieldError(field, message) {
    // remove erro antigo
    const next = field.nextElementSibling;
    if (next && next.classList && next.classList.contains("field-error")) {
      next.textContent = message;
    } else {
      const small = document.createElement("small");
      small.className = "field-error";
      small.style.color = "#ffb4b4";
      small.style.display = "block";
      small.style.marginTop = "6px";
      small.textContent = message;
      field.parentNode.insertBefore(small, field.nextSibling);
    }
    field.classList.add("invalid");
    field.focus();
  }

  function clearFieldError(field) {
    const next = field.nextElementSibling;
    if (next && next.classList && next.classList.contains("field-error")) next.textContent = "";
    field.classList.remove("invalid");
  }

  // --- Validador CPF (algoritmo padrão) ---
  function validarCPF(cpfStr) {
    const s = onlyDigits(cpfStr);
    if (s.length !== 11) return false;
    if (/^(\d)\1+$/.test(s)) return false;

    const calc = (t) => {
      let sum = 0;
      for (let i = 0; i < t; i++) sum += parseInt(s[i]) * (t + 1 - i);
      const r = (sum * 10) % 11;
      return r === 10 ? 0 : r;
    };
    return calc(9) === parseInt(s[9]) && calc(10) === parseInt(s[10]);
  }

  // --- Máscaras simples (aplicadas no input events) ---
  if (cpf) {
    cpf.addEventListener("input", e => {
      const v = onlyDigits(e.target.value).slice(0,11);
      let out = v;
      if (v.length > 9) out = v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, "$1.$2.$3-$4");
      else if (v.length > 6) out = v.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3");
      else if (v.length > 3) out = v.replace(/(\d{3})(\d{1,3})/, "$1.$2");
      e.target.value = out;
    });
  }

  if (telefone) {
    telefone.addEventListener("input", e => {
      const v = onlyDigits(e.target.value).slice(0,11);
      let out = v;
      if (v.length > 6) out = v.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
      else if (v.length > 2) out = v.replace(/(\d{2})(\d{1,5})/, "($1) $2");
      e.target.value = out;
    });
  }

  // limpa erros ao digitar
  [nome,email,ra,cpf,area,telefone].forEach(el => {
    if (!el) return;
    el.addEventListener("input", () => clearFieldError(el));
  });

  // --- Submit handler ---
  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();

    const nomeVal  = String(nome.value || "").trim();
    const emailVal = String(email.value || "").trim();
    const raVal    = String(ra.value || "").trim();
    const cpfVal   = onlyDigits(String(cpf.value || ""));
    const areaVal  = String(area.value || "").trim();
    const telVal   = String(telefone.value || "").trim();

    // Validações (ordem)
    if (!regexNome.test(nomeVal)) {
      return showFieldError(nome, "Informe o nome completo (mín. 3 letras).");
    }
    if (!regexEmail.test(emailVal)) {
      return showFieldError(email, "E-mail inválido (ex: voce@exemplo.com).");
    }
    if (!regexRA.test(raVal)) {
      return showFieldError(ra, "RA inválido — somente números (mín. 3 dígitos).");
    }
    if (!validarCPF(cpfVal)) {
      return showFieldError(cpf, "CPF inválido.");
    }
    if (!(areaVal === "PROFESSOR" || areaVal === "ADM")) {
      return showFieldError(area, "Selecione a área correta.");
    }
    if (!regexTel.test(telVal)) {
      return showFieldError(telefone, "Telefone inválido. Use (00) 00000-0000.");
    }

    // payload limpo
    const payload = {
      nome: nomeVal,
      email: emailVal,
      ra: raVal,
      cpf: cpfVal,
      area: areaVal,
      telefone: onlyDigits(telVal)
    };

    // feedback no botão
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.dataset.orig = submitBtn.textContent;
      submitBtn.textContent = "Enviando...";
    }

    try {
      const res = await fetch(ENDPOINT_CADASTRO, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Servidor retornou ${res.status} — ${t}`);
      }

      const json = await res.json();

      if (json.status === "ok" || json.success === true) {
        alert("✅ Usuário cadastrado com sucesso!");
        form.reset();
        if (typeof fecharCatalogo === "function") fecharCatalogo();
        if (typeof carregarHistorico === "function") carregarHistorico();
      } else {
        const msg = json.mensagem || json.message || JSON.stringify(json);
        alert("❌ Erro ao cadastrar: " + msg);
      }

    } catch (err) {
      console.error("Erro no envio do cadastro:", err);
      alert("Erro ao enviar. Verifique o endpoint, CORS e o console do navegador.");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = submitBtn.dataset.orig || "Cadastrar";
      }
    }
  });

});


document.addEventListener('DOMContentLoaded', () => {
  const modalEquipamento = document.getElementById('catalogoEquipamento');
  const btnAbrirEquip = document.getElementById('btnAbrirEquip');
  const btnFecharEquip = document.getElementById('btnFecharEquip');

  if (!modalEquipamento) {
    console.warn('catalogoEquipamento não encontrado no DOM.');
    return;
  }

  // expõe funções no escopo global para onclick inline (se você usar onclick)
  window.abrirEquipamento = () => {
    modalEquipamento.classList.remove('hidden');
    // bloquear scroll do fundo
    document.documentElement.style.overflow = 'hidden';
    // foco inicial para acessibilidade
    const primeiro = modalEquipamento.querySelector('input, button, select, textarea');
    primeiro?.focus();
  };

  window.fecharEquipamento = () => {
    modalEquipamento.classList.add('hidden');
    document.documentElement.style.overflow = '';
    // opcional: devolve foco ao botão que abriu
    btnAbrirEquip?.focus();
  };

  // se você preferir usar event listeners em vez de onclick:
  btnAbrirEquip?.addEventListener('click', () => window.abrirEquipamento());
  btnFecharEquip?.addEventListener('click', () => window.fecharEquipamento());

  // fechar clicando fora do conteúdo
  modalEquipamento.addEventListener('click', (e) => {
    if (e.target === modalEquipamento) {
      window.fecharEquipamento();
    }
  });

  // fechar com ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modalEquipamento.classList.contains('hidden')) {
      window.fecharEquipamento();
    }
  });

  // evita duplicar handlers se o script for carregado mais de uma vez
});

