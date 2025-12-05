<?php
/**
 * Configuração de CORS
 * Permite requisições do frontend com credentials (cookies de sessão)
 */

function setupCORS() {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if (!empty($origin)) {
        header("Access-Control-Allow-Origin: $origin");
    } else {
        header('Access-Control-Allow-Origin: *');
    }
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    header('Access-Control-Allow-Credentials: true');
    header('Content-Type: application/json; charset=utf-8');

    // Responde imediatamente para requisições OPTIONS (preflight)
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
}
