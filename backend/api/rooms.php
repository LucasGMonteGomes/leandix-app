<?php
/**
 * API de Salas
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
 * Criar nova sala
 */
function handleCreate($conn)
{
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        Response::error('Método não permitido', 405);
    }

    $input = json_decode(file_get_contents('php://input'), true);

    $nome = Validation::sanitize($input['nome'] ?? '');
    $capacidade = (int) ($input['capacidade'] ?? 0);
    $status = Validation::sanitize($input['status'] ?? 'disponivel');
    $foto = $input['foto'] ?? null;

    Validation::required($nome, 'Nome');

    if ($capacidade <= 0) {
        Response::error('Capacidade deve ser maior que zero', 400);
    }

    Validation::validateEnum($status, ['disponivel', 'reservada', 'manutencao'], 'Status');

    // Processar foto
    if (empty($foto)) {
        $foto = getDefaultRoomImage();
    } else {
        $foto = Validation::base64Image($foto);
    }

    // Inserir sala
    $stmt = $conn->prepare("
        INSERT INTO salas (nome, capacidade, status, foto) 
        VALUES (:nome, :capacidade, :status, :foto)
    ");

    $stmt->execute([
        'nome' => $nome,
        'capacidade' => $capacidade,
        'status' => $status,
        'foto' => $foto
    ]);

    $roomId = $conn->lastInsertId();

    Response::success([
        'id' => (int) $roomId,
        'nome' => $nome,
        'capacidade' => $capacidade,
        'status' => $status
    ], 'Sala criada com sucesso');
}

/**
 * Listar salas
 */
function handleList($conn)
{
    $status = $_GET['status'] ?? null;

    if ($status) {
        $stmt = $conn->prepare("SELECT * FROM salas WHERE status = :status ORDER BY nome");
        $stmt->execute(['status' => $status]);
    } else {
        $stmt = $conn->query("SELECT * FROM salas ORDER BY nome");
    }

    $rooms = $stmt->fetchAll();

    Response::success(['rooms' => $rooms]);
}

/**
 * Obter sala específica
 */
function handleGet($conn)
{
    $id = $_GET['id'] ?? null;

    if (!$id) {
        Response::error('ID não fornecido', 400);
    }

    $stmt = $conn->prepare("SELECT * FROM salas WHERE id = :id");
    $stmt->execute(['id' => $id]);
    $room = $stmt->fetch();

    if (!$room) {
        Response::notFound('Sala não encontrada');
    }

    Response::success(['room' => $room]);
}

/**
 * Atualizar sala
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
    $capacidade = (int) ($input['capacidade'] ?? 0);
    $status = Validation::sanitize($input['status'] ?? '');
    $foto = $input['foto'] ?? null;

    Validation::required($nome, 'Nome');

    if ($capacidade <= 0) {
        Response::error('Capacidade deve ser maior que zero', 400);
    }

    Validation::required($status, 'Status');
    Validation::validateEnum($status, ['disponivel', 'reservada', 'manutencao'], 'Status');

    // Montar query de atualização
    $fields = ['nome = :nome', 'capacidade = :capacidade', 'status = :status'];
    $params = ['nome' => $nome, 'capacidade' => $capacidade, 'status' => $status, 'id' => $id];

    if ($foto !== null) {
        $foto = Validation::base64Image($foto);
        $fields[] = 'foto = :foto';
        $params['foto'] = $foto;
    }

    $sql = "UPDATE salas SET " . implode(', ', $fields) . " WHERE id = :id";
    $stmt = $conn->prepare($sql);
    $stmt->execute($params);

    Response::success(null, 'Sala atualizada com sucesso');
}

/**
 * Deletar sala
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

    // Verificar se há reservas ativas
    $stmt = $conn->prepare("SELECT COUNT(*) as count FROM reservas WHERE tipo = 'sala' AND item_id = :id AND status = 'ativa'");
    $stmt->execute(['id' => $id]);
    $result = $stmt->fetch();

    if ($result['count'] > 0) {
        Response::error('Não é possível deletar sala com reservas ativas', 400);
    }

    $stmt = $conn->prepare("DELETE FROM salas WHERE id = :id");
    $stmt->execute(['id' => $id]);

    if ($stmt->rowCount() === 0) {
        Response::notFound('Sala não encontrada');
    }

    Response::success(null, 'Sala deletada com sucesso');
}

/**
 * Obter imagem padrão da sala em Base64
 */
function getDefaultRoomImage()
{
    $imagePath = __DIR__ . '/../uploads/sala-padrao.jpg';

    if (file_exists($imagePath)) {
        $imageData = base64_encode(file_get_contents($imagePath));
        return 'data:image/jpeg;base64,' . $imageData;
    }

    // Retorna um pixel transparente se não encontrar a imagem
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
}
