<?php
// Enable error reporting for development
if ($_ENV['APP_DEBUG'] ?? false) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
}

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: ' . ($_ENV['CORS_ORIGIN'] ?? '*'));
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config/database.php';
require_once 'middleware/auth.php';
require_once 'routes/api.php';

// Initialize database connection
$database = new Database();
$db = $database->getConnection();

// Parse the request URI
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);
$path = str_replace('/backend', '', $path);

// Initialize router
$router = new Router($db);

// Handle the request
try {
    $router->handleRequest($_SERVER['REQUEST_METHOD'], $path);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error: ' . $e->getMessage()]);
}