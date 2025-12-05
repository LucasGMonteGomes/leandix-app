// excluir.js - Versão completa e corrigida (fallback para mock quando API real não estiver disponível)

/* ===========================
   CONFIGURAÇÃO / CONSTANTES
   =========================== */

// Endpoints (se um dia configurar backend, altere aqui)
const API_SALAS = "/api/salas"; // endpoint real esperado (GET para listar, DELETE /api/salas/:id para excluir)

/* ===========================
   DADOS FICTÍCIOS (mock)
   =========================== */
const mockDB = {
  salas: [
    { id: 1, nome: "Sala 101", capacidade: 30, imagem: "https://picsum.photos/id/101/400/300", bloco: "Bloco A" },
    { id: 2, nome: "Sala 202", capacidade: 20, imagem: "https://picsum.photos/id/102/400/300", bloco: "Bloco B" },
    { id: 3, nome: "Laboratório de Informática", capacidade: 22, imagem: "https://picsum.photos/id/103/400/300", bloco: "Prédio Principal" },
    { id: 4, nome: "Auditório", capacidade: 120, imagem: "https://picsum.photos/id/104/400/300", bloco: "Anexo" },
    { id: 5, nome: "Sala Multifuncional", capacidade: 40, imagem: "https://picsum.photos/id/105/400/300", bloco: "Bloco C" }
  ]
};

/* ===========================
   HELPERS: MOCK / API
   =========================== */

/**
 * Tenta buscar salas da API real; se falhar, usa o mock.
 * Retorna uma Promise que resolve em array de salas.
 */
async function fetchRooms() {
  // Primeiro tenta a API real
  try {
    const resp = await fetch(API_SALAS, { method: "GET", headers: { "Accept": "application/json" } });
    if (!resp.ok) throw new Error(`API retornou status ${resp.status}`);
    const data = await resp.json();
    // assume que data é array de salas; se não for, cairá no catch abaixo
    if (!Array.isArray(data)) throw new Error("Formato inválido da resposta da API");
    return data;
  } catch (err) {
    // fallback para mock
    console.warn("Falha ao buscar salas da API, usando dados mock. Detalhe:", err.message);
    // devolve cópia para evitar mutações externas
    return JSON.parse(JSON.stringify(mockDB.salas));
  }
}

/**
 * Tenta excluir sala na API real; se falhar (ou API indisponível),
 * exclui no mock local.
 * Retorna Promise que resolve no objeto removido.
 */
async function deleteRoom(id) {
  // tenta realizar DELETE na API real
  try {
    const resp = await fetch(`${API_SALAS}/${id}`, { method: "DELETE" });
    if (resp.ok) {
      // se backend retornar corpo JSON com a sala removida, tenta ler, senão só retorna id
      try {
        const removed = await resp.json();
        return removed;
      } catch (_) {
        return { id };
      }
    } else {
      // se backend respondeu com erro, jogamos para fallback (mock)
      throw new Error(`API DELETE retornou status ${resp.status}`);
    }
  } catch (err) {
    // fallback: remover do mockDB
    console.warn("DELETE via API falhou, usando mock. Detalhe:", err.message);
    const idx = mockDB.salas.findIndex(s => Number(s.id) === Number(id));
    if (idx === -1) throw new Error("Sala não encontrada (mock)");
    const removed = mockDB.salas.splice(idx, 1)[0];
    // devolve cópia
    return JSON.parse(JSON.stringify(removed));
  }
}

/* ===========================
   RENDERIZAÇÃO & AÇÕES
   =========================== */

/**
 * Renderiza as salas como cards no elemento #cardsContainer
 * Mantém compatibilidade com seu HTML/CSS.
 */
async function carregarSalas() {
  const container = document.getElementById("cardsContainer");
  if (!container) {
    console.warn("Elemento #cardsContainer não encontrado.");
    return;
  }

  // estado de carregamento
  container.innerHTML = `<div class="card"><p class="card-title">Carregando salas...</p></div>`;

  try {
    const salas = await fetchRooms();

    // limpa container
    container.innerHTML = "";

    if (!salas || salas.length === 0) {
      container.innerHTML = `<div class="card"><p class="card-title">Nenhuma sala cadastrada</p></div>`;
      return;
    }

    salas.forEach(sala => {
      const card = document.createElement("div");
      card.classList.add("card");

      const nome = escapeHtml(String(sala.nome || "Sala sem nome"));
      const imagem = sala.imagem || "https://picsum.photos/seed/default/400/300";
      const bloco = sala.bloco ? escapeHtml(String(sala.bloco)) : "";
      const capacidade = sala.capacidade ? `${sala.capacidade} lugares` : "";

      card.innerHTML = `
        <p class="card-title">${nome}</p>
        <img src="${imagem}" alt="Imagem da sala ${nome}">
        <div style="margin-top:8px; font-size:0.9rem; text-align:left; padding-left:5px;">
          <div class="small muted">${bloco} ${capacidade ? ' • ' + capacidade : ''}</div>
        </div>
        <button class="btn-excluir" data-id="${sala.id}">Excluir</button>
      `;

      // handler do botão excluir do card
      const btn = card.querySelector(".btn-excluir");
      if (btn) {
        btn.addEventListener("click", async (ev) => {
          const id = Number(ev.currentTarget.dataset.id);
          if (!confirm("Deseja realmente excluir essa sala?")) return;

          try {
            await excluirSala(id); // função exposta (mantemos assinatura)
            // feedback
            alert("Sala excluída com sucesso!");
            // re-render
            carregarSalas();
          } catch (error) {
            console.error("Erro ao excluir sala:", error);
            alert("Erro ao excluir sala: " + (error.message || error));
            // ainda assim tenta recarregar para manter UI consistente
            try { carregarSalas(); } catch(e){/*ignore*/ }
          }
        });
      }

      container.appendChild(card);
    });

  } catch (err) {
    console.error("Erro ao carregar salas:", err);
    container.innerHTML = `<div class="card"><p class="card-title">Erro ao carregar salas: ${escapeHtml(err.message || String(err))}</p></div>`;
  }
}

/**
 * Função pública preservada do seu código original.
 * Mantém comportamento: recebe id e tenta excluir.
 */
async function excluirSala(id) {
  // id pode vir string; forçar number
  const numericId = Number(id);
  if (Number.isNaN(numericId)) throw new Error("ID inválido");

  // confirmação de segurança (caso chamada externa não confirme)
  if (!confirm("Deseja realmente excluir essa sala?")) {
    throw new Error("Operação cancelada pelo usuário");
  }

  // tenta excluir via deleteRoom (que usa API primeiro e depois mock)
  const removed = await deleteRoom(numericId);
  return removed;
}

/* ===========================
   UTILS
   =========================== */

/** Escapa HTML simples para evitar XSS em strings renderizadas */
function escapeHtml(str) {
  return str.replace(/[&<>"']/g, function (m) {
    switch (m) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#39;';
      default: return m;
    }
  });
}

/* ===========================
   INICIALIZAÇÃO (DOM READY)
   =========================== */
document.addEventListener("DOMContentLoaded", () => {
  // render principal
  carregarSalas();

  // Feedback do botão superior (se existir)
  const topBtn = document.getElementById("btnExcluirReserva");
  if (topBtn) {
    topBtn.addEventListener("click", () => {
      alert("Modo mock: clique em 'Excluir' dentro do card para remover uma sala. Se houver API ativa, a exclusão irá para o servidor.");
    });
  }

  // Tentar executar funções/elementos extras do seu código original sem quebrar caso não existam
  try { if (typeof renderCalendar === "function") renderCalendar(); } catch (e) { /* ignora se não existir */ }
  try { if (typeof backBtn !== "undefined" && backBtn) backBtn.style.display = 'none'; } catch (e) { /* ignora */ }
  try { const userNameEl = document.getElementById('user-name'); if (userNameEl) userNameEl.textContent = 'Gabriel'; } catch (e) { /* ignora */ }
});

/* ===========================
   Export (opcional em ambientes modulados)
   =========================== */
// Se você usar módulos, ative exportações. Se não, não faz diferença.
try {
  if (typeof module !== "undefined") {
    module.exports = { carregarSalas, excluirSala };
  }
} catch (e) { /* ambiente browser padrão - ignora */ }
