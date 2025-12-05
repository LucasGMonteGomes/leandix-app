// ValidateEmail.js
import { setError, removeError } from "./Utils.js";

export function setupEmailValidation(selector) {
    const input = document.querySelector(selector);

    input.addEventListener("input", () => {
        validate();
    });

    function validate() {
        const value = input.value.trim();
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

        if (!regex.test(value)) {
            setError(input, "E-mail inválido.");
        } else {
            removeError(input);
        }
    }
}
