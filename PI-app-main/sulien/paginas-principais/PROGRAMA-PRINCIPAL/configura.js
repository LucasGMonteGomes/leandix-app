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
  logout();
});

// ====================================================================
// TEMAS
// ====================================================================
const selectTema = document.getElementById("tema");

// Inicializa tudo ao carregar o DOM
document.addEventListener("DOMContentLoaded", () => {
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
