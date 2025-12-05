<?php
// ===================================
// 0. CONFIG DO AES-256
// ===================================
$secret_key = "SULIEN_KEY_2025_!@#HASH_AES256";
$secret_iv  = "SULIEN_IV_2025_!@#HASH_AES256";

function desproteger($valor) {
    global $secret_key, $secret_iv;
    if (!$valor) return "";
    $decoded = base64_decode($valor);
    return openssl_decrypt(
        $decoded,
        "AES-256-CBC",
        $secret_key,
        0,
        substr(hash("sha256", $secret_iv), 0, 16)
    );
}

// ===================================
// 1. CONEXÃO BANCO
// ===================================
$host = "sql102.infinityfree.com";
$dbname = "if0_40052179_sulien_form";
$username = "if0_40052179";
$password = "Familia05456";

$conn = new PDO(
    "mysql:host=$host;dbname=$dbname;charset=utf8",
    $username,
    $password,
    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
);

// Puxa os dados
$rows = $conn->query("SELECT * FROM contatos ORDER BY id DESC")->fetchAll(PDO::FETCH_ASSOC);
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Painel de Contatos — Sulien</title>

<style>
    body {
        font-family: "Poppins", Arial, sans-serif;
        background: #0F172A;
        color: #ffffff;
        margin: 0;
        padding: 0;
    }

    .container {
        max-width: 1400px;
        margin: 40px auto;
        padding: 20px;
    }

    h1 {
        text-align: center;
        margin-bottom: 30px;
        font-size: 32px;
        font-weight: 600;
        color: #38BDF8;
    }

    .card {
        background: #1E293B;
        padding: 25px;
        border-radius: 14px;
        box-shadow: 0 0 20px #00000060;
        border: 1px solid #334155;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        color: white;
        font-size: 14px;
    }

    th {
        background: #0EA5E9;
        color: white;
        text-align: left;
        padding: 12px;
        font-size: 15px;
        border-radius: 6px 6px 0 0;
    }

    td {
        padding: 12px;
        border-bottom: 1px solid #334155;
    }

    tr:nth-child(even) {
        background: #1E293B;
    }

    tr:nth-child(odd) {
        background: #273549;
    }

    tr:hover {
        background: #334155;
        transition: 0.2s;
    }

    /* scroll bonito */
    .table-wrapper {
        max-height: 700px;
        overflow-y: auto;
    }

    ::-webkit-scrollbar {
        width: 8px;
    }
    ::-webkit-scrollbar-track {
        background: #1E293B;
    }
    ::-webkit-scrollbar-thumb {
        background: #0EA5E9;
        border-radius: 10px;
    }

    /* BOTÃO SUPERIOR */
    .top-actions {
        display: flex;
        justify-content: flex-end;
        margin-bottom: 20px;
    }

    .btn-voltar {
        background: #0EA5E9;
        padding: 10px 18px;
        border-radius: 10px;
        font-weight: 600;
        color: white;
        text-decoration: none;
        transition: 0.2s;
        border: 1px solid #38BDF8;
    }

    .btn-voltar:hover {
        background: #38BDF8;
        transform: scale(1.05);
    }

    /* ============================
   🔵 RESPONSIVIDADE (CELULAR)
   ============================ */
@media (max-width: 768px) {

    table, thead, tbody, th, td, tr {
        display: block;
    }

    /* Esconde cabeçalho */
    thead {
        display: none;
    }

    /* Cada linha vira um cartão */
    tr {
        background: #1E293B;
        margin-bottom: 18px;
        padding: 15px;
        border-radius: 12px;
        border: 1px solid #334155;
    }

    td {
        border: none;
        padding: 10px 0;
        position: relative;
        font-size: 15px;
    }

    /* Nomeia os campos */
    td::before {
        content: attr(data-label);
        font-weight: 600;
        color: #38BDF8;
        display: block;
        margin-bottom: 4px;
    }
}

</style>
</head>
<body>

<div class="container">
    <h1>Painel de Contatos — Dados Descriptografados</h1>

    <!-- 🔵 BOTÃO DE VOLTAR (HOME) -->
    <div class="top-actions">
        <a href="animacao2.html" class="btn-voltar">← Página Principal</a>
    </div>

    <div class="card">
        <div class="table-wrapper">
            <table>
                <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>E-mail</th>
                    <th>Telefone</th>
                    <th>Empresa</th>
                    <th>Nome Empresa</th>
                    <th>CNPJ</th>
                    <th>Área</th>
                    <th>Tamanho</th>
                    <th>Assunto</th>
                    <th>Mensagem</th>
                </tr>

                <?php foreach ($rows as $r): ?>
                <tr>
                    <td data-label="ID"><?= $r['id'] ?></td>
                    <td data-label="Nome"><?= desproteger($r['nome']) ?></td>
                    <td data-label="E-mail"><?= desproteger($r['email']) ?></td>
                    <td data-label="Telefone"><?= desproteger($r['telefone']) ?></td>
                    <td data-label="Empresa"><?= $r['empresa'] ?></td>
                    <td data-label="Nome Empresa"><?= desproteger($r['nome_empresa']) ?></td>
                    <td data-label="CNPJ"><?= desproteger($r['cnpj']) ?></td>
                    <td data-label="Área"><?= desproteger($r['area_atuacao']) ?></td>
                    <td data-label="Tamanho"><?= desproteger($r['tamanho_empresa']) ?></td>
                    <td data-label="Assunto"><?= desproteger($r['assunto']) ?></td>
                    <td data-label="Mensagem"><?= desproteger($r['mensagem']) ?></td>
                </tr>
                <?php endforeach; ?>
            </table>
        </div>
    </div>
</div>

</body>
</html>
