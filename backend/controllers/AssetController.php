<?php
require_once __DIR__ . '/../services/RealTimeService.php';

class AssetController {
    private $db;
    private $realTimeService;

    public function __construct($db) {
        $this->db = $db;
        $this->realTimeService = new RealTimeService();
    }

    public function getAll() {
        try {
            $query = "SELECT * FROM assets ORDER BY created_at DESC";
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            $assets = $stmt->fetchAll();

            // Convert timestamps to ISO format
            $assets = array_map(function($asset) {
                $asset['lastUpdated'] = date('c', strtotime($asset['last_updated']));
                return $asset;
            }, $assets);

            http_response_code(200);
            echo json_encode($assets);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch assets: ' . $e->getMessage()]);
        }
    }

    public function getById($id) {
        try {
            $query = "SELECT * FROM assets WHERE id = :id";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                $asset = $stmt->fetch();
                $asset['lastUpdated'] = date('c', strtotime($asset['last_updated']));
                
                http_response_code(200);
                echo json_encode($asset);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Asset not found']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch asset: ' . $e->getMessage()]);
        }
    }

    public function create() {
        try {
            $data = json_decode(file_get_contents("php://input"), true);
            
            $required_fields = ['name', 'type', 'ip', 'os', 'criticality', 'owner', 'department'];
            foreach ($required_fields as $field) {
                if (!isset($data[$field])) {
                    http_response_code(400);
                    echo json_encode(['error' => ucfirst($field) . ' is required']);
                    return;
                }
            }

            $query = "INSERT INTO assets (name, type, ip, os, version, criticality, owner, department, location, status) 
                      VALUES (:name, :type, :ip, :os, :version, :criticality, :owner, :department, :location, :status)";
            
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':name', $data['name']);
            $stmt->bindParam(':type', $data['type']);
            $stmt->bindParam(':ip', $data['ip']);
            $stmt->bindParam(':os', $data['os']);
            $stmt->bindParam(':version', $data['version'] ?? null);
            $stmt->bindParam(':criticality', $data['criticality']);
            $stmt->bindParam(':owner', $data['owner']);
            $stmt->bindParam(':department', $data['department']);
            $stmt->bindParam(':location', $data['location'] ?? null);
            $stmt->bindParam(':status', $data['status'] ?? 'active');

            if ($stmt->execute()) {
                $asset_id = $this->db->lastInsertId();
                
                // Log activity
                $this->realTimeService->logActivity(null, 'create', 'asset', $asset_id, 'Created new asset: ' . $data['name']);
                
                // Broadcast asset update
                $this->realTimeService->broadcastAssetUpdate($asset_id, 'created');
                
                // Broadcast metrics update
                $this->realTimeService->broadcastMetricsUpdate();
                
                // Get the created asset
                $this->getById($asset_id);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to create asset']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create asset: ' . $e->getMessage()]);
        }
    }

    public function update($id) {
        try {
            $data = json_decode(file_get_contents("php://input"), true);
            
            // Build dynamic update query
            $fields = [];
            $params = [':id' => $id];
            
            $allowed_fields = ['name', 'type', 'ip', 'os', 'version', 'criticality', 'owner', 'department', 'location', 'status'];
            
            foreach ($allowed_fields as $field) {
                if (isset($data[$field])) {
                    $fields[] = "$field = :$field";
                    $params[":$field"] = $data[$field];
                }
            }
            
            if (empty($fields)) {
                http_response_code(400);
                echo json_encode(['error' => 'No valid fields to update']);
                return;
            }
            
            $query = "UPDATE assets SET " . implode(', ', $fields) . " WHERE id = :id";
            $stmt = $this->db->prepare($query);
            
            if ($stmt->execute($params)) {
                // Log activity
                $this->realTimeService->logActivity(null, 'update', 'asset', $id, 'Updated asset');
                
                // Broadcast asset update
                $this->realTimeService->broadcastAssetUpdate($id, 'updated');
                
                // Broadcast metrics update if status changed
                if (isset($data['status'])) {
                    $this->realTimeService->broadcastMetricsUpdate();
                }
                
                $this->getById($id);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to update asset']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update asset: ' . $e->getMessage()]);
        }
    }

    public function delete($id) {
        try {
            // Check if asset exists
            $check_query = "SELECT name FROM assets WHERE id = :id";
            $check_stmt = $this->db->prepare($check_query);
            $check_stmt->bindParam(':id', $id);
            $check_stmt->execute();
            
            if ($check_stmt->rowCount() === 0) {
                http_response_code(404);
                echo json_encode(['error' => 'Asset not found']);
                return;
            }
            
            $asset_name = $check_stmt->fetch()['name'];
            
            $query = "DELETE FROM assets WHERE id = :id";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id', $id);
            
            if ($stmt->execute()) {
                // Log activity
                $this->realTimeService->logActivity(null, 'delete', 'asset', $id, 'Deleted asset: ' . $asset_name);
                
                // Broadcast asset update
                $this->realTimeService->broadcastAssetUpdate($id, 'deleted');
                
                // Broadcast metrics update
                $this->realTimeService->broadcastMetricsUpdate();
                
                http_response_code(200);
                echo json_encode(['success' => true, 'message' => 'Asset deleted successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to delete asset']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete asset: ' . $e->getMessage()]);
        }
    }

    public function startScan($id) {
        try {
            // Check if asset exists
            $check_query = "SELECT name FROM assets WHERE id = :id";
            $check_stmt = $this->db->prepare($check_query);
            $check_stmt->bindParam(':id', $id);
            $check_stmt->execute();
            
            if ($check_stmt->rowCount() === 0) {
                http_response_code(404);
                echo json_encode(['error' => 'Asset not found']);
                return;
            }
            
            $asset_name = $check_stmt->fetch()['name'];
            
            // Create scan session
            $scan_query = "INSERT INTO scan_sessions (asset_id, status, progress, stage) 
                           VALUES (:asset_id, 'running', 0, 'Initializing scan...')";
            $scan_stmt = $this->db->prepare($scan_query);
            $scan_stmt->bindParam(':asset_id', $id);
            $scan_stmt->execute();
            
            $scan_id = $this->db->lastInsertId();
            
            // Log activity
            $this->realTimeService->logActivity(null, 'scan', 'asset', $id, 'Started security scan for: ' . $asset_name);
            
            // Start background scan simulation
            $this->simulateScan($id, $scan_id);
            
            // In a real implementation, this would trigger actual scanning
            http_response_code(200);
            echo json_encode([
                'success' => true, 
                'message' => 'Security scan started for asset: ' . $asset_name,
                'scanId' => $scan_id
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to start scan: ' . $e->getMessage()]);
        }
    }
    
    private function simulateScan($assetId, $scanId) {
        // This would be replaced with actual scanning logic in production
        // For now, we'll simulate the scan process
        
        $stages = [
            'Initializing scan...',
            'Port scanning...',
            'Service detection...',
            'Vulnerability assessment...',
            'Generating report...',
            'Scan completed'
        ];
        
        // In a real implementation, this would be handled by a background job queue
        // For demo purposes, we'll just update the scan session
        register_shutdown_function(function() use ($assetId, $scanId, $stages) {
            // This simulates a background process
            ignore_user_abort(true);
            set_time_limit(0);
            
            for ($progress = 0; $progress <= 100; $progress += rand(10, 20)) {
                if ($progress > 100) $progress = 100;
                
                $stageIndex = min(floor(($progress / 100) * (count($stages) - 1)), count($stages) - 1);
                $stage = $stages[$stageIndex];
                $findings = floor($progress / 15);
                
                // Update scan session
                $query = "UPDATE scan_sessions SET progress = :progress, stage = :stage, findings_count = :findings 
                          WHERE id = :scan_id";
                $stmt = $this->db->prepare($query);
                $stmt->bindParam(':progress', $progress);
                $stmt->bindParam(':stage', $stage);
                $stmt->bindParam(':findings', $findings);
                $stmt->bindParam(':scan_id', $scanId);
                $stmt->execute();
                
                if ($progress >= 100) {
                    // Mark scan as completed
                    $query = "UPDATE scan_sessions SET status = 'completed', completed_at = NOW() 
                              WHERE id = :scan_id";
                    $stmt = $this->db->prepare($query);
                    $stmt->bindParam(':scan_id', $scanId);
                    $stmt->execute();
                    break;
                }
                
                sleep(3); // Simulate scan time
            }
        });
    }

    public function getScanProgress($id) {
        try {
            $query = "SELECT * FROM scan_sessions WHERE asset_id = :asset_id ORDER BY started_at DESC LIMIT 1";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':asset_id', $id);
            $stmt->execute();
            
            if ($stmt->rowCount() > 0) {
                $scan = $stmt->fetch();
                
                http_response_code(200);
                echo json_encode([
                    'scanId' => $scan['id'],
                    'assetId' => $scan['asset_id'],
                    'isScanning' => $scan['status'] === 'running',
                    'progress' => (int)$scan['progress'],
                    'stage' => $scan['stage'],
                    'findings' => (int)$scan['findings_count'],
                    'status' => $scan['status'],
                    'startedAt' => $scan['started_at'],
                    'completedAt' => $scan['completed_at']
                ]);
            } else {
                http_response_code(200);
                echo json_encode([
                    'assetId' => $id,
                    'isScanning' => false,
                    'progress' => 0,
                    'stage' => '',
                    'findings' => 0
                ]);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to get scan progress: ' . $e->getMessage()]);
        }
    }
}