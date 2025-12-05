// ValidateFormFields.js
import { setupTelefoneMask } from "./MaskTelefone.js";
import { setupCNPJMask } from "./MaskCNPJ.js";
import { setupEmailValidation } from "./ValidateEmail.js";
import { setupNomeEmpresaValidation } from "./ValidateNomeEmpresa.js";

export function initializeValidations() {
    setupTelefoneMask("input[name='telefone']");
    setupEmailValidation("input[name='email']");
    setupNomeEmpresaValidation("input[name='nome_empresa']");
    setupCNPJMask("input[name='cnpj']");
}
