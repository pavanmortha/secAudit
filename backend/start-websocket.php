<?php
/**
 * WebSocket Server Starter Script
 * Run this script to start the WebSocket server for real-time features
 */

require_once 'vendor/autoload.php';
require_once 'websocket/WebSocketServer.php';

use Ratchet\Server\IoServer;
use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;

// Load environment variables
if (file_exists('.env')) {
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
    $dotenv->load();
}

$host = $_ENV['WEBSOCKET_HOST'] ?? 'localhost';
$port = $_ENV['WEBSOCKET_PORT'] ?? 8080;

echo "Starting WebSocket server...\n";
echo "Host: {$host}\n";
echo "Port: {$port}\n";
echo "URL: ws://{$host}:{$port}\n\n";

try {
    $server = IoServer::factory(
        new HttpServer(
            new WsServer(
                new WebSocketServer()
            )
        ),
        $port,
        $host
    );
    
    echo "WebSocket server started successfully!\n";
    echo "Listening for connections...\n\n";
    
    $server->run();
} catch (Exception $e) {
    echo "Failed to start WebSocket server: " . $e->getMessage() . "\n";
    exit(1);
}