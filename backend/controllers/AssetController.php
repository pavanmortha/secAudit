<?php
class AssetController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function getAll() {
        try {
            $query = "SELECT * FROM assets ORDER BY created_at DESC";
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            $assets = $stmt->fetchAll(PDO::FETCH_ASSOC);

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
                $asset = $stmt->fetch(PDO::FETCH_ASSOC);
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
                $this->logActivity('create', 'asset', $asset_id, 'Created new asset: ' . $data['name']);
                
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
                $this->logActivity('update', 'asset', $id, 'Updated asset');
                
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
            
            $asset_name = $check_stmt->fetch(PDO::FETCH_ASSOC)['name'];
            
            $query = "DELETE FROM assets WHERE id = :id";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id', $id);
            
            if ($stmt->execute()) {
                // Log activity
                $this->logActivity('delete', 'asset', $id, 'Deleted asset: ' . $asset_name);
                
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
            
            $asset_name = $check_stmt->fetch(PDO::FETCH_ASSOC)['name'];
            
            // Log activity
            $this->logActivity('scan', 'asset', $id, 'Started security scan for: ' . $asset_name);
            
            // In a real implementation, this would trigger actual scanning
            http_response_code(200);
            echo json_encode([
                'success' => true, 
                'message' => 'Security scan started for asset: ' . $asset_name,
                'scanId' => uniqid('scan_')
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to start scan: ' . $e->getMessage()]);
        }
    }

    private function logActivity($action, $entity_type, $entity_id, $details) {
        try {
            $query = "INSERT INTO activity_logs (action, entity_type, entity_id, details, ip_address, user_agent) 
                      VALUES (:action, :entity_type, :entity_id, :details, :ip_address, :user_agent)";
            
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':action', $action);
            $stmt->bindParam(':entity_type', $entity_type);
            $stmt->bindParam(':entity_id', $entity_id);
            $stmt->bindParam(':details', $details);
            $stmt->bindParam(':ip_address', $_SERVER['REMOTE_ADDR'] ?? null);
            $stmt->bindParam(':user_agent', $_SERVER['HTTP_USER_AGENT'] ?? null);
            $stmt->execute();
        } catch (Exception $e) {
            // Log activity errors silently to avoid breaking main functionality
            error_log("Failed to log activity: " . $e->getMessage());
        }
    }
}