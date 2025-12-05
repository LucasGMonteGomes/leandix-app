document.addEventListener("DOMContentLoaded", () => {
  const selectEmpresa = document.querySelector("select[name='empresa']");
  const camposEmpresa = document.getElementById("empresa-campos");
  const itens = document.querySelectorAll(".empresa-item");

  selectEmpresa.addEventListener("change", () => {

    if (selectEmpresa.value === "Sim") {
      
      camposEmpresa.classList.add("empresa-show");
      camposEmpresa.classList.remove("empresa-hidden");

      // Anima itens individualmente
      itens.forEach((item, index) => {
        setTimeout(() => {
          item.classList.add("show");
        }, index * 120);
      });

    } else {

      // Remove a animação quando esconde
      itens.forEach(item => item.classList.remove("show"));
      camposEmpresa.classList.add("empresa-hidden");
      camposEmpresa.classList.remove("empresa-show");

    }
  });
});
