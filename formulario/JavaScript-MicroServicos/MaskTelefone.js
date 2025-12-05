// MaskTelefone.js
import { setError, removeError, onlyNumbers } from "./Utils.js";

export function setupTelefoneMask(selector) {
  const input = document.querySelector(selector);
  if (!input) return;

  // guarda o valor anterior para comparações (opcional)
  let prevRaw = "";

  input.addEventListener("input", onInput);

  function onInput(e) {
    // valor atual bruto do input (com máscara)
    const rawValue = input.value;

    // posição do cursor antes da transformação
    const cursorPos = input.selectionStart ?? rawValue.length;

    // quantos dígitos existiam antes do cursor
    const digitsBeforeCursor = countDigitsUpTo(rawValue, cursorPos);

    // extrai apenas os dígitos
    let digits = onlyNumbers(rawValue);

    // limita a 11 dígitos
    if (digits.length > 11) digits = digits.slice(0, 11);

    // Aplica máscara (aplica somente quando tiver 3+ dígitos para não atrapalhar apagar)
    let formatted;
    if (digits.length >= 3) {
      if (digits.length <= 10) {
        // (XX) XXXX-XXXX
        formatted = digits.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").trim();
      } else {
        // (XX) XXXXX-XXXX
        formatted = digits.replace(/^(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").trim();
      }
    } else {
      // pouco dígito -> não formatar para permitir apagar naturalmente
      formatted = digits;
    }

    // seta o valor formatado
    input.value = formatted;

    // calcula nova posição do cursor com base em quantos dígitos queremos manter antes dele
    const newCursorPos = mapDigitsToCursorPosition(formatted, digitsBeforeCursor);

    // define a seleção/cursor (usamos setTimeout 0 para evitar conflitos em alguns navegadores)
    // Mas normalmente funciona sem timeout; mantive direto para garantir estabilidade.
    requestAnimationFrame(() => {
      try {
        input.setSelectionRange(newCursorPos, newCursorPos);
      } catch (err) {
        // fallback: move pro final
        input.selectionStart = input.selectionEnd = input.value.length;
      }
    });

    // valida
    validate(digits);

    // atualiza prevRaw (opcional)
    prevRaw = digits;
  }

  function validate(digits) {
    if (digits.length < 10 || digits.length > 11) {
      setError(input, "Telefone inválido.");
    } else {
      removeError(input);
    }
  }

  // conta quantos dígitos existem até index `pos` na string `str`
  function countDigitsUpTo(str, pos) {
    let count = 0;
    for (let i = 0; i < pos && i < str.length; i++) {
      if (/\d/.test(str[i])) count++;
    }
    return count;
  }

  // dado o string formatado e o número de dígitos que queremos antes do cursor,
  // retorna a posição do cursor (índice) adequada no string formatado.
  function mapDigitsToCursorPosition(formattedStr, digitsBeforeCursor) {
    if (digitsBeforeCursor <= 0) return 0;
    let count = 0;
    for (let i = 0; i < formattedStr.length; i++) {
      if (/\d/.test(formattedStr[i])) count++;
      if (count === digitsBeforeCursor) {
        // cursor deve ficar logo após este caractere
        return i + 1;
      }
    }
    // se não encontrou (ex.: usuário apagou muitos dígitos), coloca no final
    return formattedStr.length;
  }
}
