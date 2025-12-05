<?php
/**
 * API de Equipamentos
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
 * Criar novo equipamento
 */
function handleCreate($conn)
{
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        Response::error('Método não permitido', 405);
    }

    $input = json_decode(file_get_contents('php://input'), true);

    $nome = Validation::sanitize($input['nome'] ?? '');
    $tipo = Validation::sanitize($input['tipo'] ?? '');
    $status = Validation::sanitize($input['status'] ?? 'disponivel');
    $foto = $input['foto'] ?? null;

    Validation::required($nome, 'Nome');
    Validation::required($tipo, 'Tipo');
    Validation::validateEnum($status, ['disponivel', 'reservado', 'manutencao'], 'Status');

    // Processar foto
    if (empty($foto)) {
        // Usar imagem padrão baseada no tipo
        $foto = getDefaultEquipmentImage($tipo);
    } else {
        $foto = Validation::base64Image($foto);
    }

    // Inserir equipamento
    $stmt = $conn->prepare("
        INSERT INTO equipamentos (nome, tipo, status, foto) 
        VALUES (:nome, :tipo, :status, :foto)
    ");

    $stmt->execute([
        'nome' => $nome,
        'tipo' => $tipo,
        'status' => $status,
        'foto' => $foto
    ]);

    $equipmentId = $conn->lastInsertId();

    Response::success([
        'id' => (int) $equipmentId,
        'nome' => $nome,
        'tipo' => $tipo,
        'status' => $status
    ], 'Equipamento criado com sucesso');
}

/**
 * Listar equipamentos
 */
function handleList($conn)
{
    $status = $_GET['status'] ?? null;

    if ($status) {
        $stmt = $conn->prepare("SELECT * FROM equipamentos WHERE status = :status ORDER BY nome");
        $stmt->execute(['status' => $status]);
    } else {
        $stmt = $conn->query("SELECT * FROM equipamentos ORDER BY nome");
    }

    $equipments = $stmt->fetchAll();

    Response::success(['equipments' => $equipments]);
}

/**
 * Obter equipamento específico
 */
function handleGet($conn)
{
    $id = $_GET['id'] ?? null;

    if (!$id) {
        Response::error('ID não fornecido', 400);
    }

    $stmt = $conn->prepare("SELECT * FROM equipamentos WHERE id = :id");
    $stmt->execute(['id' => $id]);
    $equipment = $stmt->fetch();

    if (!$equipment) {
        Response::notFound('Equipamento não encontrado');
    }

    Response::success(['equipment' => $equipment]);
}

/**
 * Atualizar equipamento
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
    $status = Validation::sanitize($input['status'] ?? '');
    $foto = $input['foto'] ?? null;

    Validation::required($nome, 'Nome');
    Validation::required($tipo, 'Tipo');
    Validation::required($status, 'Status');
    Validation::validateEnum($status, ['disponivel', 'reservado', 'manutencao'], 'Status');

    // Montar query de atualização
    $fields = ['nome = :nome', 'tipo = :tipo', 'status = :status'];
    $params = ['nome' => $nome, 'tipo' => $tipo, 'status' => $status, 'id' => $id];

    if ($foto !== null) {
        $foto = Validation::base64Image($foto);
        $fields[] = 'foto = :foto';
        $params['foto'] = $foto;
    }

    $sql = "UPDATE equipamentos SET " . implode(', ', $fields) . " WHERE id = :id";
    $stmt = $conn->prepare($sql);
    $stmt->execute($params);

    Response::success(null, 'Equipamento atualizado com sucesso');
}

/**
 * Deletar equipamento
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
    $stmt = $conn->prepare("SELECT COUNT(*) as count FROM reservas WHERE tipo = 'equipamento' AND item_id = :id AND status = 'ativa'");
    $stmt->execute(['id' => $id]);
    $result = $stmt->fetch();

    if ($result['count'] > 0) {
        Response::error('Não é possível deletar equipamento com reservas ativas', 400);
    }

    $stmt = $conn->prepare("DELETE FROM equipamentos WHERE id = :id");
    $stmt->execute(['id' => $id]);

    if ($stmt->rowCount() === 0) {
        Response::notFound('Equipamento não encontrado');
    }

    Response::success(null, 'Equipamento deletado com sucesso');
}

/**
 * Obter imagem padrão do equipamento em Base64
 */
function getDefaultEquipmentImage($tipo)
{
    // Normalizar tipo para encontrar imagem
    $tipoNormalizado = strtolower($tipo);

    if (strpos($tipoNormalizado, 'notebook') !== false || strpos($tipoNormalizado, 'laptop') !== false) {
        $imagePath = __DIR__ . '/../uploads/notebook-padrao.avif';
    } else {
        // Usar imagem genérica de equipamento
        $imagePath = __DIR__ . '/../uploads/notebook-padrao.avif';
    }

    if (file_exists($imagePath)) {
        $imageData = base64_encode(file_get_contents($imagePath));
        $ext = pathinfo($imagePath, PATHINFO_EXTENSION);
        $mimeType = $ext === 'avif' ? 'image/avif' : 'image/png';
        return "data:{$mimeType};base64," . $imageData;
    }

    // Retorna um pixel transparente se não encontrar a imagem
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
}
