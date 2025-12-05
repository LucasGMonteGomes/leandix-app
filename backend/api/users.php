<?php
/**
 * API de Usuários
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
        case 'create':
            Session::requireAdmin();
            handleCreate($conn);
            break;

        case 'list':
            Session::requireAuth();
            handleList($conn);
            break;

        case 'get':
            Session::requireAuth();
            handleGet($conn);
            break;

        case 'update':
            Session::requireAdmin();
            handleUpdate($conn);
            break;

        case 'delete':
            Session::requireAdmin();
            handleDelete($conn);
            break;

        default:
            Response::error('Ação inválida', 400);
    }

} catch (Exception $e) {
    Response::error($e->getMessage(), 500);
}

/**
 * Criar novo usuário
 */
function handleCreate($conn)
{
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        Response::error('Método não permitido', 405);
    }

    $input = json_decode(file_get_contents('php://input'), true);

    $nome = Validation::sanitize($input['nome'] ?? '');
    $cpf = Validation::cpf($input['cpf'] ?? '');
    $ra = Validation::sanitize($input['ra'] ?? '');
    $tipo = Validation::sanitize($input['tipo'] ?? '');
    $turno = Validation::sanitize($input['turno'] ?? null);
    $foto = $input['foto'] ?? null;

    // Validações
    Validation::required($nome, 'Nome');
    Validation::required($cpf, 'CPF');
    Validation::required($ra, 'RA');
    Validation::required($tipo, 'Tipo');
    Validation::validateEnum($tipo, ['administrador', 'professor'], 'Tipo');

    // Se for professor, turno é obrigatório
    if ($tipo === 'professor') {
        Validation::required($turno, 'Turno');
        Validation::validateEnum($turno, ['manha', 'tarde', 'noite'], 'Turno');
    }

    // Processar foto
    if (empty($foto)) {
        // Usar imagem padrão
        $foto = getDefaultUserImage();
    } else {
        $foto = Validation::base64Image($foto);
    }

    // Senha padrão é o CPF
    $senha = password_hash($cpf, PASSWORD_DEFAULT);

    // Verificar se CPF ou RA já existem
    $stmt = $conn->prepare("SELECT id FROM usuarios WHERE cpf = :cpf OR ra = :ra");
    $stmt->execute(['cpf' => $cpf, 'ra' => $ra]);
    if ($stmt->fetch()) {
        Response::error('CPF ou RA já cadastrado', 400);
    }

    // Inserir usuário
    $stmt = $conn->prepare("
        INSERT INTO usuarios (nome, cpf, ra, senha, tipo, turno, foto) 
        VALUES (:nome, :cpf, :ra, :senha, :tipo, :turno, :foto)
    ");

    $stmt->execute([
        'nome' => $nome,
        'cpf' => $cpf,
        'ra' => $ra,
        'senha' => $senha,
        'tipo' => $tipo,
        'turno' => $turno,
        'foto' => $foto
    ]);

    $userId = $conn->lastInsertId();

    Response::success([
        'id' => (int) $userId,
        'nome' => $nome,
        'ra' => $ra,
        'tipo' => $tipo,
        'turno' => $turno
    ], 'Usuário criado com sucesso');
}

/**
 * Listar usuários
 */
function handleList($conn)
{
    $stmt = $conn->query("SELECT id, nome, cpf, ra, tipo, turno, foto, criado_em FROM usuarios ORDER BY nome");
    $users = $stmt->fetchAll();

    Response::success(['users' => $users]);
}

/**
 * Obter usuário específico
 */
function handleGet($conn)
{
    $id = $_GET['id'] ?? null;

    if (!$id) {
        Response::error('ID não fornecido', 400);
    }

    $stmt = $conn->prepare("SELECT id, nome, cpf, ra, tipo, turno, foto, criado_em FROM usuarios WHERE id = :id");
    $stmt->execute(['id' => $id]);
    $user = $stmt->fetch();

    if (!$user) {
        Response::notFound('Usuário não encontrado');
    }

    Response::success(['user' => $user]);
}

/**
 * Atualizar usuário
 */
function handleUpdate($conn)
{
    if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
        Response::error('Método não permitido', 405);
    }

    $id = $_GET['id'] ?? null;

    if (!$id) {
        Response::error('ID não fornecido', 400);
    }

    $input = json_decode(file_get_contents('php://input'), true);

    $nome = Validation::sanitize($input['nome'] ?? '');
    $tipo = Validation::sanitize($input['tipo'] ?? '');
    $turno = Validation::sanitize($input['turno'] ?? null);
    $foto = $input['foto'] ?? null;

    Validation::required($nome, 'Nome');
    Validation::required($tipo, 'Tipo');
    Validation::validateEnum($tipo, ['administrador', 'professor'], 'Tipo');

    if ($tipo === 'professor') {
        Validation::required($turno, 'Turno');
        Validation::validateEnum($turno, ['manha', 'tarde', 'noite'], 'Turno');
    }

    // Montar query de atualização
    $fields = ['nome = :nome', 'tipo = :tipo', 'turno = :turno'];
    $params = ['nome' => $nome, 'tipo' => $tipo, 'turno' => $turno, 'id' => $id];

    if ($foto !== null) {
        $foto = Validation::base64Image($foto);
        $fields[] = 'foto = :foto';
        $params['foto'] = $foto;
    }

    $sql = "UPDATE usuarios SET " . implode(', ', $fields) . " WHERE id = :id";
    $stmt = $conn->prepare($sql);
    $stmt->execute($params);

    Response::success(null, 'Usuário atualizado com sucesso');
}

/**
 * Deletar usuário
 */
function handleDelete($conn)
{
    if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
        Response::error('Método não permitido', 405);
    }

    $id = $_GET['id'] ?? null;

    if (!$id) {
        Response::error('ID não fornecido', 400);
    }

    $stmt = $conn->prepare("DELETE FROM usuarios WHERE id = :id");
    $stmt->execute(['id' => $id]);

    if ($stmt->rowCount() === 0) {
        Response::notFound('Usuário não encontrado');
    }

    Response::success(null, 'Usuário deletado com sucesso');
}

/**
 * Obter imagem padrão do usuário em Base64
 */
function getDefaultUserImage()
{
    $imagePath = __DIR__ . '/../uploads/imagem-padrao.png';

    if (file_exists($imagePath)) {
        $imageData = base64_encode(file_get_contents($imagePath));
        return 'data:image/png;base64,' . $imageData;
    }

    // Retorna um pixel transparente se não encontrar a imagem
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
}
