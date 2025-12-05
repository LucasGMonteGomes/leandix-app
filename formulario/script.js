// ======== Notificação ========
window.onload = function() {
  const notif = document.getElementById("notificacao");
  notif.classList.add("show");

  setTimeout(() => {
    notif.style.animation = "fadeOut 0.5s ease forwards";
    setTimeout(() => {
      notif.classList.remove("show");
      notif.style.animation = "";
    }, 500);
  }, 4000);
};

// ======== Menu Hambúrguer ========
const toggle = document.getElementById("menu-toggle");
const menu = document.getElementById("menu");

toggle.addEventListener("click", () => {
  menu.classList.toggle("active");
  toggle.textContent = menu.classList.contains("active") ? "✖" : "☰";
});
