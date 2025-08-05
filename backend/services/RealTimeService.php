<?php
require_once __DIR__ . '/../config/database.php';

class RealTimeService {
    private $db;
    private $websocketUrl;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->websocketUrl = $_ENV['WEBSOCKET_URL'] ?? 'ws://localhost:8080';
    }

    public function broadcastMetricsUpdate() {
        $metrics = $this->calculateMetrics();
        $this->broadcast('metrics_updated', $metrics);
    }

    public function broadcastVulnerabilityUpdate($vulnerabilityId, $action = 'updated') {
        $vulnerability = $this->getVulnerability($vulnerabilityId);
        $this->broadcast('vulnerability_updated', [
            'action' => $action,
            'vulnerability' => $vulnerability
        ]);
    }

    public function broadcastAssetUpdate($assetId, $action = 'updated') {
        $asset = $this->getAsset($assetId);
        $this->broadcast('asset_updated', [
            'action' => $action,
            'asset' => $asset
        ]);
    }

    public function broadcastAuditUpdate($auditId, $action = 'updated') {
        $audit = $this->getAudit($auditId);
        $this->broadcast('audit_updated', [
            'action' => $action,
            'audit' => $audit
        ]);
    }

    public function broadcastNewActivity($activity) {
        $this->broadcast('activity_new', $activity);
    }

    private function calculateMetrics() {
        $metrics = [];
        
        // Total assets
        $query = "SELECT COUNT(*) as total FROM assets WHERE status = 'active'";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        $metrics['totalAssets'] = (int)$stmt->fetch()['total'];
        
        // Total audits
        $query = "SELECT COUNT(*) as total FROM audits WHERE status IN ('scheduled', 'in_progress')";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        $metrics['totalAudits'] = (int)$stmt->fetch()['total'];
        
        // Pending vulnerabilities
        $query = "SELECT COUNT(*) as total FROM vulnerabilities WHERE status IN ('open', 'in_progress')";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        $metrics['pendingVulnerabilities'] = (int)$stmt->fetch()['total'];
        
        // Critical vulnerabilities
        $query = "SELECT COUNT(*) as total FROM vulnerabilities WHERE severity = 'critical' AND status IN ('open', 'in_progress')";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        $metrics['criticalVulnerabilities'] = (int)$stmt->fetch()['total'];
        
        // High vulnerabilities
        $query = "SELECT COUNT(*) as total FROM vulnerabilities WHERE severity = 'high' AND status IN ('open', 'in_progress')";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        $metrics['highVulnerabilities'] = (int)$stmt->fetch()['total'];
        
        // Overdue tasks
        $query = "SELECT COUNT(*) as total FROM vulnerabilities WHERE due_date < CURDATE() AND status IN ('open', 'in_progress')";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        $metrics['overdueTasks'] = (int)$stmt->fetch()['total'];
        
        // Compliance score
        $resolved_query = "SELECT COUNT(*) as resolved FROM vulnerabilities WHERE status = 'resolved'";
        $resolved_stmt = $this->db->prepare($resolved_query);
        $resolved_stmt->execute();
        $resolved_vulns = $resolved_stmt->fetch()['resolved'];
        
        $total_vulns_query = "SELECT COUNT(*) as total FROM vulnerabilities";
        $total_vulns_stmt = $this->db->prepare($total_vulns_query);
        $total_vulns_stmt->execute();
        $total_vulns = $total_vulns_stmt->fetch()['total'];
        
        $metrics['complianceScore'] = $total_vulns > 0 ? round(($resolved_vulns / $total_vulns) * 100) : 100;
        
        // Audit coverage
        $audited_assets_query = "SELECT COUNT(DISTINCT asset_id) as audited FROM audit_assets";
        $audited_assets_stmt = $this->db->prepare($audited_assets_query);
        $audited_assets_stmt->execute();
        $audited_assets = $audited_assets_stmt->fetch()['audited'];
        
        $metrics['auditCoverage'] = $metrics['totalAssets'] > 0 ? 
            round(($audited_assets / $metrics['totalAssets']) * 100) : 0;
        
        return $metrics;
    }

    private function getVulnerability($id) {
        $query = "SELECT v.*, a.name as asset_name, au.title as audit_title 
                  FROM vulnerabilities v
                  LEFT JOIN assets a ON v.asset_id = a.id
                  LEFT JOIN audits au ON v.audit_id = au.id
                  WHERE v.id = :id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->fetch();
    }

    private function getAsset($id) {
        $query = "SELECT * FROM assets WHERE id = :id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->fetch();
    }

    private function getAudit($id) {
        $query = "SELECT a.*, u1.name as auditor_name, u2.name as auditee_name
                  FROM audits a
                  LEFT JOIN users u1 ON a.auditor_id = u1.id
                  LEFT JOIN users u2 ON a.auditee_id = u2.id
                  WHERE a.id = :id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->fetch();
    }

    private function broadcast($type, $data) {
        // In a production environment, this would send data to the WebSocket server
        // For now, we'll use a simple HTTP request to a webhook endpoint
        $payload = [
            'type' => $type,
            'data' => $data,
            'timestamp' => date('c')
        ];
        
        // You could use cURL to send to WebSocket server or message queue
        $this->sendToWebSocket($payload);
    }

    private function sendToWebSocket($payload) {
        // This would integrate with your WebSocket server
        // For development, you might use a message queue like Redis
        try {
            $context = stream_context_create([
                'http' => [
                    'method' => 'POST',
                    'header' => 'Content-Type: application/json',
                    'content' => json_encode($payload)
                ]
            ]);
            
            // Send to webhook endpoint that forwards to WebSocket
            @file_get_contents('http://localhost:3001/webhook', false, $context);
        } catch (Exception $e) {
            error_log("Failed to send WebSocket message: " . $e->getMessage());
        }
    }

    public function logActivity($userId, $action, $entityType, $entityId, $details) {
        try {
            $query = "INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details, ip_address, user_agent) 
                      VALUES (:user_id, :action, :entity_type, :entity_id, :details, :ip_address, :user_agent)";
            
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':user_id', $userId);
            $stmt->bindParam(':action', $action);
            $stmt->bindParam(':entity_type', $entityType);
            $stmt->bindParam(':entity_id', $entityId);
            $stmt->bindParam(':details', $details);
            $stmt->bindParam(':ip_address', $_SERVER['REMOTE_ADDR'] ?? null);
            $stmt->bindParam(':user_agent', $_SERVER['HTTP_USER_AGENT'] ?? null);
            $stmt->execute();
            
            // Broadcast new activity
            $activity = [
                'id' => $this->db->lastInsertId(),
                'type' => $action,
                'title' => $this->formatActivityTitle($action, $entityType),
                'description' => $details,
                'timestamp' => date('c'),
                'user' => $this->getUserName($userId),
                'severity' => $this->getActivitySeverity($action)
            ];
            
            $this->broadcastNewActivity($activity);
            
        } catch (Exception $e) {
            error_log("Failed to log activity: " . $e->getMessage());
        }
    }

    private function formatActivityTitle($action, $entityType) {
        $titles = [
            'create' => 'Created new ' . $entityType,
            'update' => 'Updated ' . $entityType,
            'delete' => 'Deleted ' . $entityType,
            'scan' => 'Started security scan',
            'complete' => 'Completed audit'
        ];
        
        return $titles[$action] ?? ucfirst($action) . ' ' . $entityType;
    }

    private function getActivitySeverity($action) {
        $severities = [
            'create' => 'info',
            'update' => 'info',
            'delete' => 'warning',
            'scan' => 'info',
            'complete' => 'success'
        ];
        
        return $severities[$action] ?? 'info';
    }

    private function getUserName($userId) {
        if (!$userId) return 'System';
        
        $query = "SELECT name FROM users WHERE id = :id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':id', $userId);
        $stmt->execute();
        $result = $stmt->fetch();
        
        return $result ? $result['name'] : 'Unknown User';
    }
}