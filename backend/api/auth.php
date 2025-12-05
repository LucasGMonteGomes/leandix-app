<?php
/**
 * API de Autenticação
 */

require_once '../config/cors.php';
setupCORS();

require_once '../config/database.php';
require_once '../utils/session.php';
require_once '../utils/response.php';
require_once '../utils/validation.php';

Session::start();

$action = $_GET['action'] ?? '';

try {
    $db = new Database();
    $conn = $db->getConnection();

    switch ($action) {
        case 'login':
            handleLogin($conn);
            break;

        case 'logout':
            handleLogout();
            break;

        case 'check':
            handleCheck();
            break;

        default:
            Response::error('Ação inválida', 400);
    }

} catch (Exception $e) {
    Response::error($e->getMessage(), 500);
}

/**
 * Login do usuário
 */
function handleLogin($conn)
{
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        Response::error('Método não permitido', 405);
    }

    $input = json_decode(file_get_contents('php://input'), true);

    $ra = Validation::sanitize($input['ra'] ?? '');
    $senha = $input['senha'] ?? '';

    Validation::required($ra, 'RA');
    Validation::required($senha, 'Senha');

    // Buscar usuário por RA
    $stmt = $conn->prepare("SELECT * FROM usuarios WHERE ra = :ra LIMIT 1");
    $stmt->execute(['ra' => $ra]);
    $user = $stmt->fetch();

    if (!$user) {
        Response::error('RA ou senha inválidos', 401);
    }

    // Verificar senha (comparação direta com CPF ou senha hash)
    $senhaValida = false;

    // Primeiro tenta comparar com CPF (senha padrão)
    if ($senha === $user['cpf']) {
        $senhaValida = true;
    }
    // Se não for CPF, verifica se é senha com hash
    elseif (password_verify($senha, $user['senha'])) {
        $senhaValida = true;
    }

    if (!$senhaValida) {
        Response::error('RA ou senha inválidos', 401);
    }

    // Preparar dados do usuário (sem senha)
    $userData = [
        'id' => (int) $user['id'],
        'nome' => $user['nome'],
        'cpf' => $user['cpf'],
        'ra' => $user['ra'],
        'tipo' => $user['tipo'],
        'turno' => $user['turno'],
        'foto' => $user['foto']
    ];

    // Salvar na sessão
    Session::setUser($userData);

    Response::success([
        'user' => $userData
    ], 'Login realizado com sucesso');
}

/**
 * Logout do usuário
 */
function handleLogout()
{
    Session::destroy();
    Response::success(null, 'Logout realizado com sucesso');
}

/**
 * Verificar se está logado
 */
function handleCheck()
{
    if (Session::isLoggedIn()) {
        Response::success([
            'user' => Session::getUser()
        ]);
    } else {
        Response::error('Não autenticado', 401);
    }
}
