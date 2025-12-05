document.addEventListener("DOMContentLoaded", () => {
const iconeNotificacao = document.getElementById("IconeNotificacao");
const janelaNotificacao = document.getElementById("janelaNotificação");
const fecharNotificacao = document.getElementById("fecharNotificação");
const corpoNotificacao = janelaNotificacao.querySelector(".corpoNotificação");

// Cria bolinha de notificação (estilo no CSS)
const bolinha = document.createElement("span");
bolinha.classList.add("bolinha-notificacao");
iconeNotificacao.style.position = "relative"; // garante posição relativa
iconeNotificacao.appendChild(bolinha);

// Abrir/fechar janela
iconeNotificacao.addEventListener("click", () => {
const isAberto = janelaNotificacao.style.display === "flex";
janelaNotificacao.style.display = isAberto ? "none" : "flex";
if (!isAberto) {
bolinha.style.display = "none"; // remove bolinha ao abrir
}
});

fecharNotificacao.addEventListener("click", () => {
janelaNotificacao.style.display = "none";
});

// Endpoints da API
const API_ENDPOINT = "https://api.seusite.com/notificacoes"; // GET para buscar notificações
const API_MARK_READ = "https://api.seusite.com/notificacoes/marcar-lidas"; // POST para marcar lidas

// Buscar notificações
async function buscarNotificacoes() {
try {
const response = await fetch(API_ENDPOINT);
const data = await response.json();

  // Limpa notificações antigas
  corpoNotificacao.innerHTML = "";

  if (data && data.length > 0) {
    data.forEach(msg => {
      const div = document.createElement("div");
      div.classList.add("mensagem-item");
      div.innerHTML = `<strong>${msg.titulo}</strong><br>${msg.mensagem}`;
      corpoNotificacao.appendChild(div);
    });

    // Mostra bolinha se a janela não estiver aberta
    if (janelaNotificacao.style.display !== "flex") {
      bolinha.style.display = "block";
    }
  } else {
    corpoNotificacao.innerHTML = `<div style="padding:10px;color:var(--muted);">Nenhuma notificação</div>`;
  }
} catch (err) {
  console.error("Erro ao buscar notificações:", err);
}

}

// Atualiza notificações a cada 15s
buscarNotificacoes();
setInterval(buscarNotificacoes, 15000);

// Marcar notificações como lidas ao abrir a janela
janelaNotificacao.addEventListener("display", async () => {
try {
await fetch(API_MARK_READ, { method: "POST" });
} catch (err) {
console.error("Erro ao marcar notificações como lidas:", err);
}
});
});