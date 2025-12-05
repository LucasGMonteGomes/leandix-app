<?php
/**
 * Configuração de CORS
 * Permite requisições do frontend com credentials (cookies de sessão)
 */

function setupCORS() {
    // Origens permitidas
    $allowed_origins = [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:5500',  // Live Server VSCode
    ];

    // Adiciona origem da variável de ambiente (FRONTEND_URL para Railway/Netlify)
    $frontend_url = getenv('FRONTEND_URL');
    if ($frontend_url) {
        $allowed_origins[] = rtrim($frontend_url, '/');
        // Também adiciona versão com www se não tiver
        if (strpos($frontend_url, 'www.') === false) {
            $with_www = str_replace('https://', 'https://www.', $frontend_url);
            $allowed_origins[] = rtrim($with_www, '/');
        }
    }

    // Detecta a origem da requisição
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

    // Verifica se a origem é permitida
    if (in_array($origin, $allowed_origins)) {
        header("Access-Control-Allow-Origin: $origin");
    } else if ($frontend_url) {
        // Em produção, usa a URL do frontend configurada
        header("Access-Control-Allow-Origin: " . rtrim($frontend_url, '/'));
    } else {
        // Fallback para desenvolvimento local
        header("Access-Control-Allow-Origin: http://localhost:3000");
    }

    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    header('Content-Type: application/json; charset=utf-8');

    // Responde imediatamente para requisições OPTIONS (preflight)
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
}
