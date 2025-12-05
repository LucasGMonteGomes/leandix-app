// ValidateNomeEmpresa.js
import { setError, removeError } from "./Utils.js";

export function setupNomeEmpresaValidation(selector) {
    const input = document.querySelector(selector);

    input.addEventListener("input", validate);

    function validate() {
        const nome = input.value.trim();

        if (nome.length < 3) {
            setError(input, "Digite pelo menos 3 caracteres.");
        }
        else if (!/^[A-Za-zÀ-ú0-9\s\-\.]+$/.test(nome)) {
            setError(input, "Nome contém caracteres inválidos.");
        }
        else {
            removeError(input);
        }
    }
}
