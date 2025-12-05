<?php
// enviar_form.php
// Envia 2 emails via PHPMailer:
//  - email estilizado para o dono do site (você)
//  - autoresposta estilizada para o usuário que preencheu o formulário

// IMPORTA PHPMailer (ajuste o caminho se necessário)
require 'libs/PHPMailer/src/Exception.php';
require 'libs/PHPMailer/src/PHPMailer.php';
require 'libs/PHPMailer/src/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// CONFIGURAÇÕES IMPORTANTES (edite aqui)
$logoPath = 'https://sulienform.wuaze.com/img/logo2sulien600x338.png';            // caminho relativo ou absoluto para sua logo
$toOwner  = 'silvamachadogabriel99@gmail.com';       // quem recebe os leads (você)
$ownerName = 'Sulien';                       // nome exibido no e-mail interno

// SMTP — substitua pelos seus dados
$smtpHost = 'smtp.gmail.com';
$smtpUser = 'mrprestserv1@gmail.com';   // ex: conta de envio
$smtpPass = 'orpm dtcm axuy gntz';    // senha SMTP ou app password
$smtpPort = 587;
$smtpSecure = 'tls'; // 'tls' ou 'ssl'

// Função utilitária: retorna JSON (para AJAX) ou faz redirect/alert (não-AJAX)
function sendResponse($data) {
    // Detecta se a requisição é AJAX
    $isAjax = !empty($_SERVER['HTTP_X_REQUESTED_WITH']) &&
             strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';

    if ($isAjax) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data);
        exit;
    } else {
        // fallback: cria um alerta simples e volta
        if ($data['status'] === 'success') {
            echo "<script>alert('{$data['message']}');window.location.href='index.html';</script>";
        } else {
            echo "<script>alert('Erro: {$data['message']}');window.history.back();</script>";
        }
        exit;
    }
}

// Só processa se POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') 
{
    sendResponse(['status' => 'error', 'message' => 'Acesso inválido.']);
}

// -----------------------------
// 1) Recebe e sanitiza os campos
// -----------------------------
function in($key) 
{
    return isset($_POST[$key]) ? trim($_POST[$key]) : null;
}

$nome         = htmlspecialchars(in('nome'));
$email        = filter_var(in('email'), FILTER_SANITIZE_EMAIL);
$telefone     = htmlspecialchars(in('telefone'));
$empresa      = htmlspecialchars(in('empresa')); // Sim / Não
$nome_empresa = htmlspecialchars(in('nome_empresa'));
$cnpj         = htmlspecialchars(in('cnpj'));
$area_atuacao = htmlspecialchars(in('area_atuacao'));
$tamanho_emp  = htmlspecialchars(in('tamanho_empresa'));
$assunto      = htmlspecialchars(in('assunto'));
$mensagem     = nl2br(htmlspecialchars(in('mensagem')));

// validações mínimas
if (empty($nome) || empty($email) || empty($assunto)) {
    sendResponse(['status' => 'error', 'message' => 'Por favor preencha os campos obrigatórios.']);
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendResponse(['status' => 'error', 'message' => 'E-mail inválido.']);
}
if ($empresa === 'Sim') {
    if (empty($nome_empresa) || empty($cnpj)) {
        sendResponse(['status' => 'error', 'message' => 'Por favor preencha os dados da empresa.']);
    }
}

// -----------------------------
// 2) Monta o corpo do e-mail interno (HTML)
// -----------------------------
// Observação: muitos clientes de e-mail removem <style> externos;
// portanto usamos CSS inline e um bloco CSS curto (compatível).
$ownerHtml = "
<!doctype html>
<html>
<head>
<meta charset='utf-8'>
<meta name='viewport' content='width=device-width,initial-scale=1'>
<title>Novo Contato - {$nome}</title>
</head>
<body style='margin:0;padding:20px;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;color:#333;'>

  <table role='presentation' width='100%' style='max-width:780px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 8px 30px rgba(17,24,39,0.06);'>
    <tr>
      <td style='padding:20px 24px;border-bottom:1px solid #eef1f5;'>
        <table role='presentation' width='100%'>
          <tr>
            <td style='vertical-align:middle;'>
              <img src='{$logoPath}' alt='Logo' style='height:120px;display:block;'/>
            </td>
            <td style='text-align:right;vertical-align:middle;color:#6b7280;font-size:13px;'>
              <div>Recebido em: ".date('d/m/Y H:i')."</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <tr>
      <td style='padding:28px 24px;'>
        <h2 style='margin:0 0 12px;color:#0f172a;'>Novo contato recebido</h2>
        <p style='margin:0 0 18px;color:#475569;line-height:1.45'>Dados do formulário preenchido no site.</p>

        <table role='presentation' width='100%' style='border-collapse:collapse;'>
          <tr>
            <td style='padding:8px 0;vertical-align:top;width:160px;color:#334155;font-weight:700'>Nome</td>
            <td style='padding:8px 0;color:#475569'>{$nome}</td>
          </tr>

          <tr>
            <td style='padding:8px 0;vertical-align:top;font-weight:700;color:#334155'>E-mail</td>
            <td style='padding:8px 0;color:#475569'>{$email}</td>
          </tr>

          <tr>
            <td style='padding:8px 0;vertical-align:top;font-weight:700;color:#334155'>Telefone</td>
            <td style='padding:8px 0;color:#475569'>{$telefone}</td>
          </tr>

          <tr>
            <td style='padding:8px 0;vertical-align:top;font-weight:700;color:#334155'>Representa empresa</td>
            <td style='padding:8px 0;color:#475569'>{$empresa}</td>
          </tr>
";

// se for empresa, adiciona bloco
if ($empresa === 'Sim') {
    $ownerHtml .= "
          <tr>
            <td style='padding:8px 0;vertical-align:top;font-weight:700;color:#334155'>Nome da empresa</td>
            <td style='padding:8px 0;color:#475569'>{$nome_empresa}</td>
          </tr>
          <tr>
            <td style='padding:8px 0;vertical-align:top;font-weight:700;color:#334155'>CNPJ</td>
            <td style='padding:8px 0;color:#475569'>{$cnpj}</td>
          </tr>
          <tr>
            <td style='padding:8px 0;vertical-align:top;font-weight:700;color:#334155'>Área de atuação</td>
            <td style='padding:8px 0;color:#475569'>{$area_atuacao}</td>
          </tr>
          <tr>
            <td style='padding:8px 0;vertical-align:top;font-weight:700;color:#334155'>Porte</td>
            <td style='padding:8px 0;color:#475569'>{$tamanho_emp}</td>
          </tr>
    ";
}

$ownerHtml .= "
          <tr>
            <td style='padding:8px 0;vertical-align:top;font-weight:700;color:#334155'>Assunto</td>
            <td style='padding:8px 0;color:#475569'>{$assunto}</td>
          </tr>

          <tr>
            <td style='padding:8px 0;vertical-align:top;font-weight:700;color:#334155'>Mensagem</td>
            <td style='padding:8px 0;color:#475569'>{$mensagem}</td>
          </tr>
        </table>

        <div style='margin-top:24px;display:flex;gap:12px;'>
          <a href='mailto:{$email}' style='text-decoration:none;padding:10px 14px;background:#0ea5a4;color:#fff;border-radius:8px;font-weight:700'>Responder lead</a>
          <a href='https://sulienform.wuaze.com/animacao3.html' style='text-decoration:none;padding:10px 14px;background:#111827;color:#fff;border-radius:8px;font-weight:700'>Ver no painel</a>
        </div>
      </td>
    </tr>

    <tr>
      <td style='padding:18px 24px;background:#fafafa;color:#6b7280;font-size:13px;text-align:center'>
        <div>Recebido via formulário - Sulien</div>
      </td>
    </tr>
  </table>

</body>
</html>
";

// -----------------------------
// 3) Monta o corpo do e-mail de autoresposta para o usuário
// -----------------------------
$clientHtml = "
<!doctype html>
<html>
<head>
<meta charset='utf-8'>
<meta name='viewport' content='width=device-width,initial-scale=1'>
<title>Recebemos sua solicitação</title>
</head>
<body style='margin:0;padding:20px;background:linear-gradient(180deg,#0ea5a4 0%, #7dd3fc 100%);font-family:Arial,Helvetica,sans-serif;color:#0f172a;'>

  <table role='presentation' width='100%' style='max-width:720px;margin:0 auto;border-radius:14px;overflow:hidden;'>
    <tr>
      <td style='background:rgba(255,255,255,0.95);padding:28px;border-radius:12px;'>
        <div style='text-align:center;margin-bottom:16px;'>
          <img src='{$logoPath}' alt='Logo' style='height:220px;display:block;margin:0 auto;'/>
        </div>

        <h1 style='font-size:20px;margin:0 0 12px;color:#0f172a;text-align:center;'>Recebemos sua solicitação</h1>
        <p style='text-align:center;color:#374151;margin:0 0 18px;'>Olá <strong>{$nome}</strong>, agradecemos por entrar em contato. Recebemos sua mensagem e nossa equipe vai responder em breve.</p>

        <div style='background:#fff;padding:14px;border-radius:10px;box-shadow:0 6px 18px rgba(2,6,23,0.06);margin-bottom:18px;'>
          <p style='margin:0;font-weight:700;color:#0f172a;'>Resumo da sua solicitação</p>
          <p style='margin:8px 0 0;color:#374151;font-size:14px;line-height:1.4;'>
            <strong>Assunto:</strong> {$assunto} <br/>
            <strong>Mensagem:</strong> {$mensagem}
          </p>
        </div>

        <div style='text-align:center;'>
          <a href='https://sulienform.wuaze.com/' style='display:inline-block;padding:12px 18px;background:#0ea5a4;color:#fff;border-radius:10px;text-decoration:none;font-weight:700;'>Voltar ao site</a>
        </div>

        <p style='color:#6b7280;font-size:12px;text-align:center;margin-top:18px;'>Se quiser conversar por WhatsApp, responda esse e-mail ou nos chame pelo número informado no cabeçalho.</p>

        <div style='text-align:center;margin-top:18px;font-size:12px;color:#94a3b8;'>© ".date('Y')." Sulien. Todos os direitos reservados.</div>
      </td>
    </tr>
  </table>

</body>
</html>
";

// -----------------------------
// 4) Envia os e-mails via PHPMailer
// -----------------------------
$mail = new PHPMailer(true);

try {
    // Configuração SMTP
    $mail->isSMTP();
    $mail->Host = $smtpHost;
    $mail->SMTPAuth = true;
    $mail->Username = $smtpUser;
    $mail->Password = $smtpPass;
    $mail->SMTPSecure = $smtpSecure;
    $mail->Port = $smtpPort;
    $mail->CharSet = 'UTF-8';
    $mail->setFrom($smtpUser, $ownerName); // remetente visível

    // ---------- Envia para o dono (interno) ----------
    $mail->clearAllRecipients();
    $mail->addAddress($toOwner, $ownerName);
    $mail->addReplyTo($email, $nome); // reply-to para responder ao lead
    $mail->isHTML(true);
    $mail->Subject = "Novo contato: {$nome} — {$assunto}";
    $mail->Body = $ownerHtml;
    $mail->AltBody = "Novo contato: {$nome}\nAssunto: {$assunto}\nMensagem:\n".strip_tags($mensagem);

    $mail->send();

    // ---------- Autoresposta ao usuário ----------
    $mail->clearAllRecipients();
    $mail->addAddress($email, $nome);
    $mail->setFrom($smtpUser, $ownerName); // remetente (pode ser o mesmo)
    $mail->isHTML(true);
    $mail->Subject = "Recebemos sua solicitação — Sulien";
    $mail->Body = $clientHtml;
    $mail->AltBody = "Olá {$nome}, recebemos sua solicitação. Em breve responderemos.";

    $mail->send();

} 
catch (Exception $e) 
{
    // registra o erro sem vazar dados para o usuário
    error_log("PHPMailer error: " . $mail->ErrorInfo);
    sendResponse(['status' => 'error', 'message' => 'Falha ao enviar e-mails.']);
}

?>
