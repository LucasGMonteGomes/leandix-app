// ====================================================================
// BOTÕES DE NAVEGAÇÃO
// ====================================================================
const navBtns = document.querySelectorAll(".nav-btn");

navBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelector(".nav-btn.active")?.classList.remove("active");
    btn.classList.add("active");
    console.log("Mudando para:", btn.dataset.route);
  });
});

// ====================================================================
// LOGOUT
// ====================================================================
const logoutBtn = document.getElementById("logoutBtn");

logoutBtn?.addEventListener("click", () => {
  alert("Logout realizado!");
});

// ====================================================================
// ENDPOINT
// ====================================================================
const ENDPOINT_HISTORICO = "https://api.seuservidor.com/historico";

// ====================================================================
// BUSCAR HISTÓRICO
// ====================================================================
async function carregarHistorico() {
  const historicoList = document.getElementById("historico-list");

  if (!historicoList) {
    console.warn("Elemento #historico-list não encontrado.");
    return;
  }

  try {
    const resposta = await fetch(ENDPOINT_HISTORICO);

    if (!resposta.ok) {
      throw new Error("Erro HTTP: " + resposta.status);
    }

    const dados = await resposta.json();

    if (!Array.isArray(dados)) {
      throw new Error("Formato de dados inválido");
    }

    historicoList.innerHTML = "";

    dados.forEach(item => {
      const div = document.createElement("div");
      div.className = "historico-item";

      div.innerHTML = `
        <div><span>Sala:</span> ${item.sala ?? "—"}</div>
        <div><span>Turma:</span> ${item.turma ?? "—"}</div>
        <div><span>Dias:</span> ${item.dias ?? "—"}</div>
      `;

      historicoList.appendChild(div);
    });

  } catch (erro) {
    console.error("Erro ao carregar histórico:", erro);

    historicoList.innerHTML = `
      <div class="erro-historico">
        Erro ao carregar histórico. Tente novamente.
      </div>
    `;
  }
}

// ====================================================================
// TEMAS
// ====================================================================
const selectTema = document.getElementById("tema");

// Inicializa tudo ao carregar o DOM
document.addEventListener("DOMContentLoaded", () => {
  // Carrega histórico
  carregarHistorico();

  // Aplica tema salvo
  const temaSalvo = localStorage.getItem("tema") || "Claro";
  if (temaSalvo === "Escuro") document.documentElement.classList.add("dark-theme");
  if (selectTema) selectTema.value = temaSalvo;

  // Quando o usuário mudar o tema
  selectTema?.addEventListener("change", () => {
    const tema = selectTema.value;
    if (tema === "Escuro") {
      document.documentElement.classList.add("dark-theme");
    } else {
      document.documentElement.classList.remove("dark-theme");
    }
    localStorage.setItem("tema", tema);
  });
});
