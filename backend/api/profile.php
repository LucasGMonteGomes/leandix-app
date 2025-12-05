<?php
/**
 * API de Perfil do Usuário
 */

require_once '../config/cors.php';
setupCORS();

require_once '../config/database.php';
require_once '../utils/session.php';
require_once '../utils/response.php';
require_once '../utils/validation.php';

Session::start();
Session::requireAuth();

$action = $_GET['action'] ?? '';

try {
    $db = new Database();
    $conn = $db->getConnection();

    switch ($action) {
        case 'get':
            handleGet($conn);
            break;

        case 'update-password':
            handleUpdatePassword($conn);
            break;

        case 'update-photo':
            handleUpdatePhoto($conn);
            break;

        default:
            Response::error('Ação inválida', 400);
    }

} catch (Exception $e) {
    Response::error($e->getMessage(), 500);
}

/**
 * Obter perfil do usuário logado
 */
function handleGet($conn)
{
    $userId = Session::getUserId();

    $stmt = $conn->prepare("SELECT id, nome, cpf, ra, tipo, turno, foto, criado_em FROM usuarios WHERE id = :id");
    $stmt->execute(['id' => $userId]);
    $user = $stmt->fetch();

    if (!$user) {
        Response::notFound('Usuário não encontrado');
    }

    Response::success(['user' => $user]);
}

/**
 * Atualizar senha do usuário
 */
function handleUpdatePassword($conn)
{
    if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
        Response::error('Método não permitido', 405);
    }

    $input = json_decode(file_get_contents('php://input'), true);

    $senha_atual = $input['senha_atual'] ?? '';
    $senha_nova = $input['senha_nova'] ?? '';

    Validation::required($senha_atual, 'Senha atual');
    Validation::required($senha_nova, 'Nova senha');

    if (strlen($senha_nova) < 6) {
        Response::error('A nova senha deve ter no mínimo 6 caracteres', 400);
    }

    $userId = Session::getUserId();

    // Buscar usuário
    $stmt = $conn->prepare("SELECT senha, cpf FROM usuarios WHERE id = :id");
    $stmt->execute(['id' => $userId]);
    $user = $stmt->fetch();

    if (!$user) {
        Response::notFound('Usuário não encontrado');
    }

    // Verificar senha atual
    $senhaValida = false;

    // Verifica se a senha atual é o CPF (senha padrão)
    if ($senha_atual === $user['cpf']) {
        $senhaValida = true;
    }
    // Ou se é a senha com hash
    elseif (password_verify($senha_atual, $user['senha'])) {
        $senhaValida = true;
    }

    if (!$senhaValida) {
        Response::error('Senha atual incorreta', 401);
    }

    // Atualizar senha
    $novaSenhaHash = password_hash($senha_nova, PASSWORD_DEFAULT);

    $stmt = $conn->prepare("UPDATE usuarios SET senha = :senha WHERE id = :id");
    $stmt->execute(['senha' => $novaSenhaHash, 'id' => $userId]);

    Response::success(null, 'Senha atualizada com sucesso');
}

/**
 * Atualizar foto do usuário
 */
function handleUpdatePhoto($conn)
{
    if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
        Response::error('Método não permitido', 405);
    }

    $input = json_decode(file_get_contents('php://input'), true);

    $foto = $input['foto'] ?? null;

    if (empty($foto)) {
        Response::error('Foto não fornecida', 400);
    }

    $foto = Validation::base64Image($foto);
    $userId = Session::getUserId();

    // Atualizar foto
    $stmt = $conn->prepare("UPDATE usuarios SET foto = :foto WHERE id = :id");
    $stmt->execute(['foto' => $foto, 'id' => $userId]);

    // Atualizar sessão
    $stmt = $conn->prepare("SELECT id, nome, cpf, ra, tipo, turno, foto FROM usuarios WHERE id = :id");
    $stmt->execute(['id' => $userId]);
    $user = $stmt->fetch();

    Session::setUser($user);

    Response::success(['foto' => $foto], 'Foto atualizada com sucesso');
}
