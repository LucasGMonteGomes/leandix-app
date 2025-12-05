<?php
/**
 * API de Reservas
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
            Session::requireAuth();
            handleCreate($conn);
            break;

        case 'list':
            Session::requireAuth();
            handleList($conn);
            break;

        case 'my-reservations':
            Session::requireAuth();
            handleMyReservations($conn);
            break;

        case 'cancel':
            Session::requireAuth();
            handleCancel($conn);
            break;

        default:
            Response::error('Ação inválida', 400);
    }

} catch (Exception $e) {
    Response::error($e->getMessage(), 500);
}

/**
 * Criar nova reserva
 */
function handleCreate($conn)
{
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        Response::error('Método não permitido', 405);
    }

    $input = json_decode(file_get_contents('php://input'), true);

    $tipo = Validation::sanitize($input['tipo'] ?? '');
    $item_id = (int) ($input['item_id'] ?? 0);
    $data_inicio = $input['data_inicio'] ?? '';
    $data_fim = $input['data_fim'] ?? '';

    Validation::required($tipo, 'Tipo');
    Validation::required($data_inicio, 'Data de início');
    Validation::required($data_fim, 'Data de fim');
    Validation::validateEnum($tipo, ['equipamento', 'sala'], 'Tipo');

    if ($item_id <= 0) {
        Response::error('ID do item inválido', 400);
    }

    // Validar datas
    $inicio = strtotime($data_inicio);
    $fim = strtotime($data_fim);

    if (!$inicio || !$fim) {
        Response::error('Formato de data inválido', 400);
    }

    if ($fim <= $inicio) {
        Response::error('Data de fim deve ser posterior à data de início', 400);
    }

    // Verificar se o item existe e está disponível
    $table = $tipo === 'equipamento' ? 'equipamentos' : 'salas';
    $stmt = $conn->prepare("SELECT status FROM {$table} WHERE id = :id");
    $stmt->execute(['id' => $item_id]);
    $item = $stmt->fetch();

    if (!$item) {
        Response::error(ucfirst($tipo) . ' não encontrado', 404);
    }

    if ($item['status'] === 'manutencao') {
        Response::error(ucfirst($tipo) . ' em manutenção', 400);
    }

    // Verificar conflitos de horário
    $stmt = $conn->prepare("
        SELECT COUNT(*) as count 
        FROM reservas 
        WHERE tipo = :tipo 
        AND item_id = :item_id 
        AND status = 'ativa'
        AND (
            (data_inicio <= :data_inicio AND data_fim > :data_inicio)
            OR (data_inicio < :data_fim AND data_fim >= :data_fim)
            OR (data_inicio >= :data_inicio AND data_fim <= :data_fim)
        )
    ");

    $stmt->execute([
        'tipo' => $tipo,
        'item_id' => $item_id,
        'data_inicio' => $data_inicio,
        'data_fim' => $data_fim
    ]);

    $result = $stmt->fetch();

    if ($result['count'] > 0) {
        Response::error('Já existe uma reserva neste horário', 400);
    }

    // Criar reserva
    $userId = Session::getUserId();

    $stmt = $conn->prepare("
        INSERT INTO reservas (usuario_id, tipo, item_id, data_inicio, data_fim, status) 
        VALUES (:usuario_id, :tipo, :item_id, :data_inicio, :data_fim, 'ativa')
    ");

    $stmt->execute([
        'usuario_id' => $userId,
        'tipo' => $tipo,
        'item_id' => $item_id,
        'data_inicio' => $data_inicio,
        'data_fim' => $data_fim
    ]);

    $reservationId = $conn->lastInsertId();

    // Atualizar status do item para 'reservado' ou 'reservada'
    $newStatus = $tipo === 'equipamento' ? 'reservado' : 'reservada';
    $stmt = $conn->prepare("UPDATE {$table} SET status = :status WHERE id = :id");
    $stmt->execute(['status' => $newStatus, 'id' => $item_id]);

    Response::success([
        'id' => (int) $reservationId,
        'tipo' => $tipo,
        'item_id' => $item_id
    ], 'Reserva criada com sucesso');
}

/**
 * Listar todas as reservas (admin)
 */
function handleList($conn)
{
    $user = Session::getUser();

    // Se não for admin, redireciona para minhas reservas
    if ($user['tipo'] !== 'administrador') {
        handleMyReservations($conn);
        return;
    }

    $stmt = $conn->query("
        SELECT 
            r.*,
            u.nome as usuario_nome,
            u.ra as usuario_ra,
            CASE 
                WHEN r.tipo = 'equipamento' THEN e.nome
                WHEN r.tipo = 'sala' THEN s.nome
            END as item_nome
        FROM reservas r
        INNER JOIN usuarios u ON r.usuario_id = u.id
        LEFT JOIN equipamentos e ON r.tipo = 'equipamento' AND r.item_id = e.id
        LEFT JOIN salas s ON r.tipo = 'sala' AND r.item_id = s.id
        ORDER BY r.data_inicio DESC
    ");

    $reservations = $stmt->fetchAll();

    Response::success(['reservations' => $reservations]);
}

/**
 * Listar minhas reservas
 */
function handleMyReservations($conn)
{
    $userId = Session::getUserId();

    $stmt = $conn->prepare("
        SELECT 
            r.*,
            CASE 
                WHEN r.tipo = 'equipamento' THEN e.nome
                WHEN r.tipo = 'sala' THEN s.nome
            END as item_nome,
            CASE 
                WHEN r.tipo = 'equipamento' THEN e.foto
                WHEN r.tipo = 'sala' THEN s.foto
            END as item_foto
        FROM reservas r
        LEFT JOIN equipamentos e ON r.tipo = 'equipamento' AND r.item_id = e.id
        LEFT JOIN salas s ON r.tipo = 'sala' AND r.item_id = s.id
        WHERE r.usuario_id = :usuario_id
        ORDER BY r.data_inicio DESC
    ");

    $stmt->execute(['usuario_id' => $userId]);
    $reservations = $stmt->fetchAll();

    Response::success(['reservations' => $reservations]);
}

/**
 * Cancelar reserva
 */
function handleCancel($conn)
{
    if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
        Response::error('Método não permitido', 405);
    }

    $id = $_GET['id'] ?? null;

    if (!$id) {
        Response::error('ID não fornecido', 400);
    }

    $userId = Session::getUserId();
    $user = Session::getUser();

    // Buscar reserva
    $stmt = $conn->prepare("SELECT * FROM reservas WHERE id = :id");
    $stmt->execute(['id' => $id]);
    $reservation = $stmt->fetch();

    if (!$reservation) {
        Response::notFound('Reserva não encontrada');
    }

    // Verificar permissão (apenas o dono ou admin pode cancelar)
    if ($reservation['usuario_id'] != $userId && $user['tipo'] !== 'administrador') {
        Response::forbidden('Você não tem permissão para cancelar esta reserva');
    }

    // Cancelar reserva
    $stmt = $conn->prepare("UPDATE reservas SET status = 'cancelada' WHERE id = :id");
    $stmt->execute(['id' => $id]);

    // Liberar o item (voltar para disponível)
    $table = $reservation['tipo'] === 'equipamento' ? 'equipamentos' : 'salas';
    $stmt = $conn->prepare("UPDATE {$table} SET status = 'disponivel' WHERE id = :id");
    $stmt->execute(['id' => $reservation['item_id']]);

    Response::success(null, 'Reserva cancelada com sucesso');
}
