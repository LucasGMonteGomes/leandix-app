<?php
/**
 * Utilitários de Validação
 */

class Validation
{

    public static function required($value, $fieldName)
    {
        if (empty($value) && $value !== '0') {
            throw new Exception("O campo '{$fieldName}' é obrigatório");
        }
    }

    public static function cpf($cpf)
    {
        $cpf = preg_replace('/[^0-9]/', '', $cpf);

        if (strlen($cpf) != 11) {
            throw new Exception("CPF inválido");
        }

        return $cpf;
    }

    public static function base64Image($data)
    {
        if (empty($data)) {
            return null;
        }

        // Se já está em formato data:image
        if (strpos($data, 'data:image') === 0) {
            return $data;
        }

        // Se é base64 puro, adiciona o prefixo
        if (base64_decode($data, true) !== false) {
            return 'data:image/png;base64,' . $data;
        }

        throw new Exception("Formato de imagem inválido");
    }

    public static function sanitize($data)
    {
        if (is_array($data)) {
            return array_map([self::class, 'sanitize'], $data);
        }

        return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
    }

    public static function validateEnum($value, $allowedValues, $fieldName)
    {
        if (!in_array($value, $allowedValues)) {
            throw new Exception("Valor inválido para '{$fieldName}'. Valores permitidos: " . implode(', ', $allowedValues));
        }
    }
}
