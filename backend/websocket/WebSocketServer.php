<?php
require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../config/database.php';

use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;
use Ratchet\Server\IoServer;
use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;

class WebSocketServer implements MessageComponentInterface {
    protected $clients;
    protected $db;
    protected $rooms;

    public function __construct() {
        $this->clients = new \SplObjectStorage;
        $this->rooms = [];
        
        $database = new Database();
        $this->db = $database->getConnection();
        
        echo "WebSocket server initialized\n";
    }

    public function onOpen(ConnectionInterface $conn) {
        $this->clients->attach($conn);
        $conn->rooms = [];
        
        echo "New connection! ({$conn->resourceId})\n";
        
        // Store connection in database
        $this->storeConnection($conn->resourceId);
    }

    public function onMessage(ConnectionInterface $from, $msg) {
        $data = json_decode($msg, true);
        
        if (!$data || !isset($data['type'])) {
            return;
        }

        switch ($data['type']) {
            case 'join_room':
                $this->joinRoom($from, $data['room']);
                break;
                
            case 'leave_room':
                $this->leaveRoom($from, $data['room']);
                break;
                
            case 'start_scan':
                $this->startAssetScan($from, $data['assetId']);
                break;
                
            case 'ping':
                $this->handlePing($from);
                break;
                
            case 'authenticate':
                $this->authenticateConnection($from, $data['token']);
                break;
        }
    }

    public function onClose(ConnectionInterface $conn) {
        $this->clients->detach($conn);
        
        // Remove from all rooms
        foreach ($conn->rooms as $room) {
            $this->leaveRoom($conn, $room);
        }
        
        // Remove from database
        $this->removeConnection($conn->resourceId);
        
        echo "Connection {$conn->resourceId} has disconnected\n";
    }

    public function onError(ConnectionInterface $conn, \Exception $e) {
        echo "An error has occurred: {$e->getMessage()}\n";
        $conn->close();
    }

    private function joinRoom(ConnectionInterface $conn, $room) {
        if (!isset($this->rooms[$room])) {
            $this->rooms[$room] = new \SplObjectStorage;
        }
        
        $this->rooms[$room]->attach($conn);
        $conn->rooms[] = $room;
        
        echo "Connection {$conn->resourceId} joined room: {$room}\n";
    }

    private function leaveRoom(ConnectionInterface $conn, $room) {
        if (isset($this->rooms[$room])) {
            $this->rooms[$room]->detach($conn);
            
            if (count($this->rooms[$room]) === 0) {
                unset($this->rooms[$room]);
            }
        }
        
        $conn->rooms = array_filter($conn->rooms, function($r) use ($room) {
            return $r !== $room;
        });
        
        echo "Connection {$conn->resourceId} left room: {$room}\n";
    }

    private function startAssetScan($from, $assetId) {
        // Create scan session
        $query = "INSERT INTO scan_sessions (asset_id, status, progress, stage) 
                  VALUES (:asset_id, 'running', 0, 'Initializing scan...')";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':asset_id', $assetId);
        $stmt->execute();
        
        $scanId = $this->db->lastInsertId();
        
        // Start background scan process
        $this->simulateScan($assetId, $scanId);
        
        echo "Started scan for asset {$assetId}\n";
    }

    private function simulateScan($assetId, $scanId) {
        // This would be replaced with actual scanning logic
        $stages = [
            'Initializing scan...',
            'Port scanning...',
            'Service detection...',
            'Vulnerability assessment...',
            'Generating report...',
            'Scan completed'
        ];
        
        // Simulate scan progress
        for ($progress = 0; $progress <= 100; $progress += rand(5, 15)) {
            if ($progress > 100) $progress = 100;
            
            $stageIndex = min(floor(($progress / 100) * (count($stages) - 1)), count($stages) - 1);
            $stage = $stages[$stageIndex];
            $findings = floor($progress / 10);
            
            // Update scan session
            $query = "UPDATE scan_sessions SET progress = :progress, stage = :stage, findings_count = :findings 
                      WHERE id = :scan_id";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':progress', $progress);
            $stmt->bindParam(':stage', $stage);
            $stmt->bindParam(':findings', $findings);
            $stmt->bindParam(':scan_id', $scanId);
            $stmt->execute();
            
            // Broadcast progress to room
            $this->broadcastToRoom("asset:{$assetId}", [
                'type' => 'scan_progress',
                'assetId' => $assetId,
                'scanId' => $scanId,
                'isScanning' => $progress < 100,
                'progress' => $progress,
                'stage' => $stage,
                'findings' => $findings
            ]);
            
            if ($progress >= 100) {
                // Mark scan as completed
                $query = "UPDATE scan_sessions SET status = 'completed', completed_at = NOW() 
                          WHERE id = :scan_id";
                $stmt = $this->db->prepare($query);
                $stmt->bindParam(':scan_id', $scanId);
                $stmt->execute();
                break;
            }
            
            sleep(2); // Simulate scan time
        }
    }

    private function handlePing($from) {
        $from->send(json_encode(['type' => 'pong']));
        
        // Update last ping time
        $query = "UPDATE websocket_connections SET last_ping = NOW() WHERE id = :id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':id', $from->resourceId);
        $stmt->execute();
    }

    private function authenticateConnection($from, $token) {
        // Verify JWT token and associate user with connection
        try {
            // This would include JWT verification logic
            $from->authenticated = true;
            $from->send(json_encode(['type' => 'auth_success']));
        } catch (Exception $e) {
            $from->send(json_encode(['type' => 'auth_error', 'message' => 'Invalid token']));
        }
    }

    private function broadcastToRoom($room, $data) {
        if (!isset($this->rooms[$room])) {
            return;
        }
        
        $message = json_encode($data);
        
        foreach ($this->rooms[$room] as $client) {
            $client->send($message);
        }
    }

    public function broadcastToAll($data) {
        $message = json_encode($data);
        
        foreach ($this->clients as $client) {
            $client->send($message);
        }
    }

    private function storeConnection($connectionId) {
        try {
            $query = "INSERT INTO websocket_connections (id) VALUES (:id) 
                      ON DUPLICATE KEY UPDATE connected_at = NOW(), last_ping = NOW()";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id', $connectionId);
            $stmt->execute();
        } catch (Exception $e) {
            echo "Failed to store connection: " . $e->getMessage() . "\n";
        }
    }

    private function removeConnection($connectionId) {
        try {
            $query = "DELETE FROM websocket_connections WHERE id = :id";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id', $connectionId);
            $stmt->execute();
        } catch (Exception $e) {
            echo "Failed to remove connection: " . $e->getMessage() . "\n";
        }
    }

    // Method to broadcast updates from external sources
    public function broadcastUpdate($type, $data) {
        $message = [
            'type' => $type,
            'data' => $data,
            'timestamp' => date('c')
        ];
        
        $this->broadcastToAll($message);
    }
}

// Start WebSocket server if this file is run directly
if (basename(__FILE__) == basename($_SERVER['SCRIPT_NAME'])) {
    $server = IoServer::factory(
        new HttpServer(
            new WsServer(
                new WebSocketServer()
            )
        ),
        8080
    );
    
    echo "WebSocket server started on port 8080\n";
    $server->run();
}