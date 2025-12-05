<?php
/**
 * Utilitário para Respostas JSON
 */

class Response
{

    public static function json($data, $statusCode = 200)
    {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit;
    }

    public static function success($data = null, $message = null)
    {
        $response = ['success' => true];

        if ($message !== null) {
            $response['message'] = $message;
        }

        if ($data !== null) {
            $response = array_merge($response, is_array($data) ? $data : ['data' => $data]);
        }

        self::json($response);
    }

    public static function error($message, $statusCode = 400, $errors = null)
    {
        $response = [
            'success' => false,
            'message' => $message
        ];

        if ($errors !== null) {
            $response['errors'] = $errors;
        }

        self::json($response, $statusCode);
    }

    public static function notFound($message = 'Recurso não encontrado')
    {
        self::error($message, 404);
    }

    public static function unauthorized($message = 'Não autorizado')
    {
        self::error($message, 401);
    }

    public static function forbidden($message = 'Acesso negado')
    {
        self::error($message, 403);
    }
}
