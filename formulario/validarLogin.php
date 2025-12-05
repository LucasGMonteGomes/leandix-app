<?php
session_start();

// =============================
// 1. Conexão com banco
// =============================
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

// =============================
// 2. Se enviado POST, validar
// =============================
if ($_SERVER["REQUEST_METHOD"] === "POST") {

    $usuario = trim($_POST["usuario"]);
    $senha   = trim($_POST["senha"]);

    // Buscar usuário
    $stmt = $conn->prepare("SELECT * FROM administradores WHERE Login = ?");
    $stmt->execute([$usuario]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo "<script>alert('Usuário não encontrado!');window.location='loginADM.html';</script>";
        exit;
    }

    // Comparar senha normal
    if ($senha === $user["Senha"]) {

        $_SESSION["adm_id"] = $user["Id_U"];
        $_SESSION["adm_nome"] = $user["Login"];

        header("Location: animacao5.html");
        exit;

    } else {
        echo "<script>alert('Senha incorreta!');window.location='loginADM.html';</script>";
        exit;
    }
}
?>
