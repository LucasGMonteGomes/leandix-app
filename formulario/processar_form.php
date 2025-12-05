<?php

// ===================================
// 0. CONFIGURAÇÃO DA CRIPTOGRAFIA
// ===================================
$secret_key = "SULIEN_KEY_2025_!@#HASH_AES256"; // mude para uma chave própria
$secret_iv  = "SULIEN_IV_2025_!@#HASH_AES256";

function proteger($valor) {
    global $secret_key, $secret_iv;
    $output = openssl_encrypt(
        $valor,
        "AES-256-CBC",
        $secret_key,
        0,
        substr(hash("sha256", $secret_iv), 0, 16)
    );
    return base64_encode($output);
}


// ===================================
// 1. CAPTURAR OS CAMPOS DO FORMULÁRIO
// ===================================

$nome     = $_POST['nome'] ?? null;
$email    = $_POST['email'] ?? null;
$telefone = $_POST['telefone'] ?? null;

$empresa  = $_POST['empresa'] ?? null;
$nome_empresa = $_POST['nome_empresa'] ?? null;
$cnpj         = $_POST['cnpj'] ?? null;
$area_atuacao = $_POST['area_atuacao'] ?? null;
$tamanho_emp  = $_POST['tamanho_empresa'] ?? null;

$assunto  = $_POST['assunto'] ?? null;
$mensagem = $_POST['mensagem'] ?? null;


// ===================================
// 3. SALVAR NO BANCO DE DADOS (InfinityFree)
// ===================================

$host = "sql102.infinityfree.com";
$dbname = "if0_40052179_sulien_form";
$username = "if0_40052179";
$password = "Familia05456";

try {

    // Conexão segura
    $conn = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8",
        $username,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT => false,
            PDO::MYSQL_ATTR_SSL_CA => false
        ]
    );

    // SQL com placeholders
    $sql = "INSERT INTO contatos (
        nome, email, telefone, empresa,
        nome_empresa, cnpj, area_atuacao, tamanho_empresa,
        assunto, mensagem
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    $stmt = $conn->prepare($sql);

    // Executa criptografando dados sensíveis
    $stmt->execute([
        proteger($nome),
        proteger($email),
        proteger($telefone),
        $empresa, // esse não precisa ser criptografado

        proteger($nome_empresa),
        proteger($cnpj),
        proteger($area_atuacao),
        proteger($tamanho_emp),

        proteger($assunto),
        proteger($mensagem)
    ]);

} catch (Exception $e) {
    error_log("ERRO SQL: " . $e->getMessage());
    // Você pode criar uma página erro.html
    // header("Location: /formulario/erro.html");
    // exit;
}



// ===================================
// 4. CHAMAR O ARQUIVO DE E-MAIL
// ===================================
require_once "enviar_email.php";


// ===================================
// 5. REDIRECIONAMENTO FINAL
// ===================================
header("Location: sucesso.html");
exit;

?>
