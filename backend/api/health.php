<?php
require_once '../config/cors.php';
setupCORS();

http_response_code(200);
echo json_encode([
    'success' => true,
    'status' => 'ok',
    'timestamp' => time()
]);
