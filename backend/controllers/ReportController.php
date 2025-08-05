<?php
class ReportController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function getAll() {
        try {
            $query = "SELECT r.*, u.name as generated_by_name, a.title as audit_title
                      FROM reports r
                      LEFT JOIN users u ON r.generated_by = u.id
                      LEFT JOIN audits a ON r.audit_id = a.id
                      ORDER BY r.generated_date DESC";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            $reports = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Format data for frontend
            $reports = array_map(function($report) {
                return [
                    'id' => $report['id'],
                    'title' => $report['title'],
                    'type' => $report['type'],
                    'auditId' => $report['audit_id'],
                    'generatedBy' => $report['generated_by_name'],
                    'status' => $report['status'],
                    'filePath' => $report['file_path'],
                    'fileSize' => $report['file_size'],
                    'format' => $report['format'],
                    'generatedDate' => $report['generated_date'],
                    'auditTitle' => $report['audit_title']
                ];
            }, $reports);

            http_response_code(200);
            echo json_encode($reports);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch reports: ' . $e->getMessage()]);
        }
    }

    public function getById($id) {
        try {
            $query = "SELECT r.*, u.name as generated_by_name, a.title as audit_title
                      FROM reports r
                      LEFT JOIN users u ON r.generated_by = u.id
                      LEFT JOIN audits a ON r.audit_id = a.id
                      WHERE r.id = :id";
            
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                $report = $stmt->fetch(PDO::FETCH_ASSOC);
                
                $formatted_report = [
                    'id' => $report['id'],
                    'title' => $report['title'],
                    'type' => $report['type'],
                    'auditId' => $report['audit_id'],
                    'generatedBy' => $report['generated_by_name'],
                    'status' => $report['status'],
                    'filePath' => $report['file_path'],
                    'fileSize' => $report['file_size'],
                    'format' => $report['format'],
                    'generatedDate' => $report['generated_date'],
                    'auditTitle' => $report['audit_title']
                ];
                
                http_response_code(200);
                echo json_encode($formatted_report);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Report not found']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch report: ' . $e->getMessage()]);
        }
    }

    public function create() {
        try {
            $data = json_decode(file_get_contents("php://input"), true);
            
            $required_fields = ['title', 'type', 'generatedBy'];
            foreach ($required_fields as $field) {
                if (!isset($data[$field])) {
                    http_response_code(400);
                    echo json_encode(['error' => ucfirst($field) . ' is required']);
                    return;
                }
            }

            $query = "INSERT INTO reports (title, type, audit_id, generated_by, status, format) 
                      VALUES (:title, :type, :audit_id, :generated_by, :status, :format)";
            
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':title', $data['title']);
            $stmt->bindParam(':type', $data['type']);
            $stmt->bindParam(':audit_id', $data['auditId'] ?? null);
            $stmt->bindParam(':generated_by', $data['generatedBy']);
            $stmt->bindParam(':status', $data['status'] ?? 'draft');
            $stmt->bindParam(':format', $data['format'] ?? 'pdf');

            if ($stmt->execute()) {
                $report_id = $this->db->lastInsertId();
                
                // Log activity
                $this->logActivity('create', 'report', $report_id, 'Created new report: ' . $data['title']);
                
                $this->getById($report_id);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to create report']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create report: ' . $e->getMessage()]);
        }
    }

    public function generate() {
        try {
            $data = json_decode(file_get_contents("php://input"), true);
            
            if (!isset($data['type'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Report type is required']);
                return;
            }

            // Generate report based on type
            $report_data = $this->generateReportData($data['type'], $data['params'] ?? []);
            
            // Create report record
            $title = $this->getReportTitle($data['type'], $data['params'] ?? []);
            $file_name = $this->generateFileName($data['type']);
            $file_path = 'reports/' . $file_name;
            
            // In a real implementation, you would generate the actual file here
            $file_size = $this->calculateFileSize($report_data);
            
            $query = "INSERT INTO reports (title, type, audit_id, generated_by, status, file_path, file_size, format) 
                      VALUES (:title, :type, :audit_id, :generated_by, :status, :file_path, :file_size, :format)";
            
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':title', $title);
            $stmt->bindParam(':type', $data['type']);
            $stmt->bindParam(':audit_id', $data['params']['auditId'] ?? null);
            $stmt->bindParam(':generated_by', 1); // Default user ID for demo
            $stmt->bindParam(':status', 'final');
            $stmt->bindParam(':file_path', $file_path);
            $stmt->bindParam(':file_size', $file_size);
            $stmt->bindParam(':format', $data['params']['format'] ?? 'pdf');

            if ($stmt->execute()) {
                $report_id = $this->db->lastInsertId();
                
                // Log activity
                $this->logActivity('generate', 'report', $report_id, 'Generated report: ' . $title);
                
                http_response_code(201);
                echo json_encode([
                    'success' => true,
                    'reportId' => $report_id,
                    'message' => 'Report generated successfully',
                    'downloadUrl' => '/api/reports/download/' . $report_id
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to generate report']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to generate report: ' . $e->getMessage()]);
        }
    }

    public function download($id) {
        try {
            $query = "SELECT * FROM reports WHERE id = :id";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                $report = $stmt->fetch(PDO::FETCH_ASSOC);
                
                // In a real implementation, you would serve the actual file
                // For demo purposes, we'll return a JSON response
                http_response_code(200);
                echo json_encode([
                    'success' => true,
                    'message' => 'Report download initiated',
                    'fileName' => basename($report['file_path']),
                    'fileSize' => $report['file_size'],
                    'format' => $report['format']
                ]);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Report not found']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to download report: ' . $e->getMessage()]);
        }
    }

    public function delete($id) {
        try {
            // Check if report exists
            $check_query = "SELECT title, file_path FROM reports WHERE id = :id";
            $check_stmt = $this->db->prepare($check_query);
            $check_stmt->bindParam(':id', $id);
            $check_stmt->execute();
            
            if ($check_stmt->rowCount() === 0) {
                http_response_code(404);
                echo json_encode(['error' => 'Report not found']);
                return;
            }
            
            $report = $check_stmt->fetch(PDO::FETCH_ASSOC);
            
            $query = "DELETE FROM reports WHERE id = :id";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id', $id);
            
            if ($stmt->execute()) {
                // In a real implementation, you would also delete the physical file
                // unlink($report['file_path']);
                
                // Log activity
                $this->logActivity('delete', 'report', $id, 'Deleted report: ' . $report['title']);
                
                http_response_code(200);
                echo json_encode(['success' => true, 'message' => 'Report deleted successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to delete report']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete report: ' . $e->getMessage()]);
        }
    }

    private function generateReportData($type, $params) {
        // This would contain the actual report generation logic
        switch ($type) {
            case 'audit_summary':
                return $this->generateAuditSummary($params);
            case 'vulnerability_report':
                return $this->generateVulnerabilityReport($params);
            case 'compliance_report':
                return $this->generateComplianceReport($params);
            case 'executive_summary':
                return $this->generateExecutiveSummary($params);
            default:
                return [];
        }
    }

    private function generateAuditSummary($params) {
        // Generate audit summary data
        return ['type' => 'audit_summary', 'data' => 'Sample audit summary data'];
    }

    private function generateVulnerabilityReport($params) {
        // Generate vulnerability report data
        return ['type' => 'vulnerability_report', 'data' => 'Sample vulnerability report data'];
    }

    private function generateComplianceReport($params) {
        // Generate compliance report data
        return ['type' => 'compliance_report', 'data' => 'Sample compliance report data'];
    }

    private function generateExecutiveSummary($params) {
        // Generate executive summary data
        return ['type' => 'executive_summary', 'data' => 'Sample executive summary data'];
    }

    private function getReportTitle($type, $params) {
        $titles = [
            'audit_summary' => 'Audit Summary Report',
            'vulnerability_report' => 'Vulnerability Assessment Report',
            'compliance_report' => 'Compliance Status Report',
            'executive_summary' => 'Executive Security Summary'
        ];
        
        $base_title = $titles[$type] ?? 'Security Report';
        return $base_title . ' - ' . date('Y-m-d');
    }

    private function generateFileName($type) {
        $prefix = str_replace('_', '-', $type);
        return $prefix . '-' . date('Y-m-d-H-i-s') . '.pdf';
    }

    private function calculateFileSize($data) {
        // Simulate file size calculation
        return rand(1, 5) . '.' . rand(0, 9) . ' MB';
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