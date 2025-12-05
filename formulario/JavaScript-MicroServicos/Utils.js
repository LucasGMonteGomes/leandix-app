// Utils.js
export function setError(input, message) {
    const box = input.closest(".input-box");
    removeError(input);
    
    const error = document.createElement("span");
    error.className = "error-message";
    error.textContent = message;

    box.appendChild(error);
    input.classList.add("input-error");
}

export function removeError(input) {
    const box = input.closest(".input-box");
    const existing = box.querySelector(".error-message");
    if (existing) existing.remove();
    input.classList.remove("input-error");
}

export function onlyNumbers(text) {
    return text.replace(/\D/g, "");
}
