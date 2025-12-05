<?php
require_once '../config/cors.php';
setupCORS();

// Informações da API
$info = [
    'name' => 'Sulien API',
    'version' => '1.0.0',
    'description' => 'API simples para sistema de reservas',
    'endpoints' => [
        'auth' => '/api/auth.php',
        'users' => '/api/users.php',
        'equipment' => '/api/equipment.php',
        'rooms' => '/api/rooms.php',
        'reservations' => '/api/reservations.php',
        'profile' => '/api/profile.php'
    ]
];

echo json_encode($info, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
