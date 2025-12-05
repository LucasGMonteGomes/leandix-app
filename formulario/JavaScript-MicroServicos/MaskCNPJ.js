// MaskCNPJ.js
import { setError, removeError, onlyNumbers } from "./Utils.js";

export function setupCNPJMask(selector) {
    const input = document.querySelector(selector);

    input.addEventListener("input", () => {
        let cnpj = onlyNumbers(input.value).slice(0, 14);

        input.value = cnpj
            .replace(/^(\d{2})(\d)/, "$1.$2")
            .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
            .replace(/\.(\d{3})(\d)/, ".$1/$2")
            .replace(/(\d{4})(\d)/, "$1-$2");

        validate();
    });

    function validate() {
        const cnpj = onlyNumbers(input.value);
        if (!validarCNPJ(cnpj)) {
            setError(input, "CNPJ inválido.");
        } else {
            removeError(input);
        }
    }

    function validarCNPJ(cnpj) {
        if (cnpj.length !== 14) return false;
        if (/^(\d)\1+$/.test(cnpj)) return false;

        let tamanho = cnpj.length - 2
        let numeros = cnpj.substring(0, tamanho);
        let digitos = cnpj.substring(tamanho);
        let soma = 0;
        let pos = tamanho - 7;

        for (let i = tamanho; i >= 1; i--) {
            soma += numeros.charAt(tamanho - i) * pos--;
            if (pos < 2) pos = 9;
        }

        let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
        if (resultado != digitos.charAt(0)) return false;

        tamanho = tamanho + 1;
        numeros = cnpj.substring(0, tamanho);
        soma = 0;
        pos = tamanho - 7;

        for (let i = tamanho; i >= 1; i--) {
            soma += numeros.charAt(tamanho - i) * pos--;
            if (pos < 2) pos = 9;
        }
        resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;

        return resultado == digitos.charAt(1);
    }
}
