<?php
class AuditController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function getAll() {
        try {
            $query = "SELECT a.*, 
                             u1.name as auditor_name, 
                             u2.name as auditee_name,
                             GROUP_CONCAT(DISTINCT ast.id) as asset_ids,
                             GROUP_CONCAT(DISTINCT ast.name) as asset_names
                      FROM audits a
                      LEFT JOIN users u1 ON a.auditor_id = u1.id
                      LEFT JOIN users u2 ON a.auditee_id = u2.id
                      LEFT JOIN audit_assets aa ON a.id = aa.audit_id
                      LEFT JOIN assets ast ON aa.asset_id = ast.id
                      GROUP BY a.id
                      ORDER BY a.created_at DESC";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            $audits = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Format data for frontend
            $audits = array_map(function($audit) {
                return [
                    'id' => $audit['id'],
                    'title' => $audit['title'],
                    'type' => $audit['type'],
                    'scope' => explode(',', $audit['scope']),
                    'assetIds' => $audit['asset_ids'] ? explode(',', $audit['asset_ids']) : [],
                    'auditorId' => $audit['auditor_id'],
                    'auditeeId' => $audit['auditee_id'],
                    'status' => $audit['status'],
                    'scheduledDate' => $audit['scheduled_date'],
                    'completedDate' => $audit['completed_date'],
                    'frequency' => $audit['frequency'],
                    'documents' => $audit['documents'] ? json_decode($audit['documents'], true) : [],
                    'auditorName' => $audit['auditor_name'],
                    'auditeeName' => $audit['auditee_name'],
                    'assetNames' => $audit['asset_names'] ? explode(',', $audit['asset_names']) : []
                ];
            }, $audits);

            http_response_code(200);
            echo json_encode($audits);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch audits: ' . $e->getMessage()]);
        }
    }

    public function getById($id) {
        try {
            $query = "SELECT a.*, 
                             u1.name as auditor_name, 
                             u2.name as auditee_name,
                             GROUP_CONCAT(DISTINCT ast.id) as asset_ids,
                             GROUP_CONCAT(DISTINCT ast.name) as asset_names
                      FROM audits a
                      LEFT JOIN users u1 ON a.auditor_id = u1.id
                      LEFT JOIN users u2 ON a.auditee_id = u2.id
                      LEFT JOIN audit_assets aa ON a.id = aa.audit_id
                      LEFT JOIN assets ast ON aa.asset_id = ast.id
                      WHERE a.id = :id
                      GROUP BY a.id";
            
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                $audit = $stmt->fetch(PDO::FETCH_ASSOC);
                
                $formatted_audit = [
                    'id' => $audit['id'],
                    'title' => $audit['title'],
                    'type' => $audit['type'],
                    'scope' => explode(',', $audit['scope']),
                    'assetIds' => $audit['asset_ids'] ? explode(',', $audit['asset_ids']) : [],
                    'auditorId' => $audit['auditor_id'],
                    'auditeeId' => $audit['auditee_id'],
                    'status' => $audit['status'],
                    'scheduledDate' => $audit['scheduled_date'],
                    'completedDate' => $audit['completed_date'],
                    'frequency' => $audit['frequency'],
                    'documents' => $audit['documents'] ? json_decode($audit['documents'], true) : [],
                    'auditorName' => $audit['auditor_name'],
                    'auditeeName' => $audit['auditee_name'],
                    'assetNames' => $audit['asset_names'] ? explode(',', $audit['asset_names']) : []
                ];
                
                http_response_code(200);
                echo json_encode($formatted_audit);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Audit not found']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch audit: ' . $e->getMessage()]);
        }
    }

    public function create() {
        try {
            $data = json_decode(file_get_contents("php://input"), true);
            
            $required_fields = ['title', 'type', 'scope', 'auditorId', 'auditeeId', 'scheduledDate', 'frequency'];
            foreach ($required_fields as $field) {
                if (!isset($data[$field])) {
                    http_response_code(400);
                    echo json_encode(['error' => ucfirst($field) . ' is required']);
                    return;
                }
            }

            $this->db->beginTransaction();

            // Insert audit
            $query = "INSERT INTO audits (title, type, scope, auditor_id, auditee_id, scheduled_date, frequency, documents) 
                      VALUES (:title, :type, :scope, :auditor_id, :auditee_id, :scheduled_date, :frequency, :documents)";
            
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':title', $data['title']);
            $stmt->bindParam(':type', $data['type']);
            $stmt->bindParam(':scope', is_array($data['scope']) ? implode(',', $data['scope']) : $data['scope']);
            $stmt->bindParam(':auditor_id', $data['auditorId']);
            $stmt->bindParam(':auditee_id', $data['auditeeId']);
            $stmt->bindParam(':scheduled_date', $data['scheduledDate']);
            $stmt->bindParam(':frequency', $data['frequency']);
            $stmt->bindParam(':documents', isset($data['documents']) ? json_encode($data['documents']) : null);

            if ($stmt->execute()) {
                $audit_id = $this->db->lastInsertId();
                
                // Insert audit-asset relationships
                if (isset($data['assetIds']) && is_array($data['assetIds'])) {
                    $asset_query = "INSERT INTO audit_assets (audit_id, asset_id) VALUES (:audit_id, :asset_id)";
                    $asset_stmt = $this->db->prepare($asset_query);
                    
                    foreach ($data['assetIds'] as $asset_id) {
                        $asset_stmt->bindParam(':audit_id', $audit_id);
                        $asset_stmt->bindParam(':asset_id', $asset_id);
                        $asset_stmt->execute();
                    }
                }
                
                $this->db->commit();
                
                // Log activity
                $this->logActivity('create', 'audit', $audit_id, 'Created new audit: ' . $data['title']);
                
                $this->getById($audit_id);
            } else {
                $this->db->rollBack();
                http_response_code(500);
                echo json_encode(['error' => 'Failed to create audit']);
            }
        } catch (Exception $e) {
            $this->db->rollBack();
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create audit: ' . $e->getMessage()]);
        }
    }

    public function update($id) {
        try {
            $data = json_decode(file_get_contents("php://input"), true);
            
            $this->db->beginTransaction();
            
            // Build dynamic update query
            $fields = [];
            $params = [':id' => $id];
            
            $field_mappings = [
                'title' => 'title',
                'type' => 'type',
                'auditorId' => 'auditor_id',
                'auditeeId' => 'auditee_id',
                'scheduledDate' => 'scheduled_date',
                'completedDate' => 'completed_date',
                'frequency' => 'frequency',
                'status' => 'status'
            ];
            
            foreach ($field_mappings as $frontend_field => $db_field) {
                if (isset($data[$frontend_field])) {
                    $fields[] = "$db_field = :$db_field";
                    $params[":$db_field"] = $data[$frontend_field];
                }
            }

            // Handle scope
            if (isset($data['scope'])) {
                $fields[] = "scope = :scope";
                $params[":scope"] = is_array($data['scope']) ? implode(',', $data['scope']) : $data['scope'];
            }

            // Handle documents
            if (isset($data['documents'])) {
                $fields[] = "documents = :documents";
                $params[":documents"] = json_encode($data['documents']);
            }
            
            if (!empty($fields)) {
                $query = "UPDATE audits SET " . implode(', ', $fields) . " WHERE id = :id";
                $stmt = $this->db->prepare($query);
                $stmt->execute($params);
            }

            // Update audit-asset relationships if provided
            if (isset($data['assetIds']) && is_array($data['assetIds'])) {
                // Delete existing relationships
                $delete_query = "DELETE FROM audit_assets WHERE audit_id = :audit_id";
                $delete_stmt = $this->db->prepare($delete_query);
                $delete_stmt->bindParam(':audit_id', $id);
                $delete_stmt->execute();
                
                // Insert new relationships
                if (!empty($data['assetIds'])) {
                    $asset_query = "INSERT INTO audit_assets (audit_id, asset_id) VALUES (:audit_id, :asset_id)";
                    $asset_stmt = $this->db->prepare($asset_query);
                    
                    foreach ($data['assetIds'] as $asset_id) {
                        $asset_stmt->bindParam(':audit_id', $id);
                        $asset_stmt->bindParam(':asset_id', $asset_id);
                        $asset_stmt->execute();
                    }
                }
            }
            
            $this->db->commit();
            
            // Log activity
            $this->logActivity('update', 'audit', $id, 'Updated audit');
            
            $this->getById($id);
        } catch (Exception $e) {
            $this->db->rollBack();
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update audit: ' . $e->getMessage()]);
        }
    }

    public function delete($id) {
        try {
            // Check if audit exists
            $check_query = "SELECT title FROM audits WHERE id = :id";
            $check_stmt = $this->db->prepare($check_query);
            $check_stmt->bindParam(':id', $id);
            $check_stmt->execute();
            
            if ($check_stmt->rowCount() === 0) {
                http_response_code(404);
                echo json_encode(['error' => 'Audit not found']);
                return;
            }
            
            $audit_title = $check_stmt->fetch(PDO::FETCH_ASSOC)['title'];
            
            $this->db->beginTransaction();
            
            // Delete audit-asset relationships (will be handled by foreign key cascade)
            // Delete the audit
            $query = "DELETE FROM audits WHERE id = :id";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id', $id);
            
            if ($stmt->execute()) {
                $this->db->commit();
                
                // Log activity
                $this->logActivity('delete', 'audit', $id, 'Deleted audit: ' . $audit_title);
                
                http_response_code(200);
                echo json_encode(['success' => true, 'message' => 'Audit deleted successfully']);
            } else {
                $this->db->rollBack();
                http_response_code(500);
                echo json_encode(['error' => 'Failed to delete audit']);
            }
        } catch (Exception $e) {
            $this->db->rollBack();
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete audit: ' . $e->getMessage()]);
        }
    }

    public function startAudit($id) {
        try {
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Audit ID is required']);
                return;
            }

            $query = "UPDATE audits SET status = 'in_progress' WHERE id = :id AND status = 'scheduled'";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id', $id);
            
            if ($stmt->execute() && $stmt->rowCount() > 0) {
                // Log activity
                $this->logActivity('start', 'audit', $id, 'Started audit');
                
                http_response_code(200);
                echo json_encode(['success' => true, 'message' => 'Audit started successfully']);
            } else {
                http_response_code(400);
                echo json_encode(['error' => 'Audit not found or cannot be started']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to start audit: ' . $e->getMessage()]);
        }
    }

    public function completeAudit($id) {
        try {
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Audit ID is required']);
                return;
            }

            $query = "UPDATE audits SET status = 'completed', completed_date = CURDATE() WHERE id = :id AND status = 'in_progress'";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id', $id);
            
            if ($stmt->execute() && $stmt->rowCount() > 0) {
                // Log activity
                $this->logActivity('complete', 'audit', $id, 'Completed audit');
                
                http_response_code(200);
                echo json_encode(['success' => true, 'message' => 'Audit completed successfully']);
            } else {
                http_response_code(400);
                echo json_encode(['error' => 'Audit not found or cannot be completed']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to complete audit: ' . $e->getMessage()]);
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
            error_log("Failed to log activity: " . $e->getMessage());
        }
    }
}