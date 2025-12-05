-- ============================================================================
-- Script de Inicialização do Banco de Dados - Sistema Sulien
-- ============================================================================

-- Criar banco de dados se não existir
CREATE DATABASE IF NOT EXISTS sulien_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sulien_db;

-- ============================================================================
-- Tabela de Usuários
-- ============================================================================
CREATE TABLE IF NOT EXISTS usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(11) UNIQUE NOT NULL,
    ra VARCHAR(20) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    tipo ENUM('administrador', 'professor') NOT NULL,
    turno ENUM('manha', 'tarde', 'noite') NULL,
    foto LONGTEXT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_cpf (cpf),
    INDEX idx_ra (ra),
    INDEX idx_tipo (tipo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Tabela de Equipamentos
-- ============================================================================
CREATE TABLE IF NOT EXISTS equipamentos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(100) NOT NULL,
    status ENUM('disponivel', 'reservado', 'manutencao') DEFAULT 'disponivel',
    foto LONGTEXT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_tipo (tipo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Tabela de Salas
-- ============================================================================
CREATE TABLE IF NOT EXISTS salas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(255) NOT NULL,
    capacidade INT NOT NULL,
    status ENUM('disponivel', 'reservada', 'manutencao') DEFAULT 'disponivel',
    foto LONGTEXT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Tabela de Reservas
-- ============================================================================
CREATE TABLE IF NOT EXISTS reservas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    tipo ENUM('equipamento', 'sala') NOT NULL,
    item_id INT NOT NULL,
    data_inicio DATETIME NOT NULL,
    data_fim DATETIME NOT NULL,
    status ENUM('ativa', 'cancelada', 'concluida') DEFAULT 'ativa',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario (usuario_id),
    INDEX idx_tipo_item (tipo, item_id),
    INDEX idx_status (status),
    INDEX idx_datas (data_inicio, data_fim)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Dados Iniciais
-- ============================================================================

-- Inserir usuário administrador padrão
-- Username: admin (RA)
-- Senha padrão: 00000000000 (CPF)
INSERT INTO usuarios (nome, cpf, ra, senha, tipo, turno, foto) 
VALUES (
    'Administrador',
    '00000000000',
    'admin',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- Hash de '00000000000'
    'administrador',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE id=id;

-- Inserir professor de exemplo
-- Username: 12345 (RA)
-- Senha padrão: 12345678901 (CPF)
INSERT INTO usuarios (nome, cpf, ra, senha, tipo, turno, foto) 
VALUES (
    'Professor Exemplo',
    '12345678901',
    '12345',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- Será substituído pelo CPF no primeiro login
    'professor',
    'manha',
    NULL
) ON DUPLICATE KEY UPDATE id=id;

-- Inserir equipamentos de exemplo
INSERT INTO equipamentos (nome, tipo, status, foto) 
VALUES 
    ('Notebook Dell Inspiron 15', 'notebook', 'disponivel', NULL),
    ('Notebook HP Pavilion', 'notebook', 'disponivel', NULL),
    ('Projetor Epson', 'projetor', 'disponivel', NULL)
ON DUPLICATE KEY UPDATE id=id;

-- Inserir salas de exemplo
INSERT INTO salas (nome, capacidade, status, foto) 
VALUES 
    ('Sala 101', 30, 'disponivel', NULL),
    ('Sala 102', 25, 'disponivel', NULL),
    ('Laboratório de Informática', 40, 'disponivel', NULL)
ON DUPLICATE KEY UPDATE id=id;

-- ============================================================================
-- Triggers para atualizar status automaticamente
-- ============================================================================

-- Trigger para marcar reservas como concluídas automaticamente
DELIMITER $$

CREATE TRIGGER IF NOT EXISTS update_reservation_status
BEFORE UPDATE ON reservas
FOR EACH ROW
BEGIN
    IF NEW.data_fim < NOW() AND NEW.status = 'ativa' THEN
        SET NEW.status = 'concluida';
    END IF;
END$$

DELIMITER ;

-- ============================================================================
-- Views úteis
-- ============================================================================

-- View de reservas com informações completas
CREATE OR REPLACE VIEW vw_reservas_completas AS
SELECT 
    r.id,
    r.usuario_id,
    u.nome AS usuario_nome,
    u.ra AS usuario_ra,
    r.tipo,
    r.item_id,
    CASE 
        WHEN r.tipo = 'equipamento' THEN e.nome
        WHEN r.tipo = 'sala' THEN s.nome
    END AS item_nome,
    r.data_inicio,
    r.data_fim,
    r.status,
    r.criado_em
FROM reservas r
INNER JOIN usuarios u ON r.usuario_id = u.id
LEFT JOIN equipamentos e ON r.tipo = 'equipamento' AND r.item_id = e.id
LEFT JOIN salas s ON r.tipo = 'sala' AND r.item_id = s.id;

-- ============================================================================
-- Procedure para limpar reservas antigas
-- ============================================================================

DELIMITER $$

CREATE PROCEDURE IF NOT EXISTS limpar_reservas_antigas()
BEGIN
    -- Marcar reservas antigas como concluídas
    UPDATE reservas 
    SET status = 'concluida' 
    WHERE data_fim < DATE_SUB(NOW(), INTERVAL 30 DAY) 
    AND status = 'ativa';
    
    -- Liberar equipamentos e salas de reservas concluídas/canceladas
    UPDATE equipamentos e
    SET e.status = 'disponivel'
    WHERE e.status = 'reservado'
    AND NOT EXISTS (
        SELECT 1 FROM reservas r 
        WHERE r.tipo = 'equipamento' 
        AND r.item_id = e.id 
        AND r.status = 'ativa'
    );
    
    UPDATE salas s
    SET s.status = 'disponivel'
    WHERE s.status = 'reservada'
    AND NOT EXISTS (
        SELECT 1 FROM reservas r 
        WHERE r.tipo = 'sala' 
        AND r.item_id = s.id 
        AND r.status = 'ativa'
    );
END$$

DELIMITER ;

-- ============================================================================
-- Informações finais
-- ============================================================================

SELECT 'Banco de dados inicializado com sucesso!' AS mensagem;
SELECT 'Usuário admin criado - RA: admin, Senha: 00000000000' AS credenciais;
