<?php
require_once __DIR__ . '/../services/RealTimeService.php';

class DashboardController {
    private $db;
    private $realTimeService;

    public function __construct($db) {
        $this->db = $db;
        $this->realTimeService = new RealTimeService();
    }

    public function getMetrics() {
        try {
            // Get total assets
            $assets_query = "SELECT COUNT(*) as total FROM assets WHERE status = 'active'";
            $assets_stmt = $this->db->prepare($assets_query);
            $assets_stmt->execute();
            $total_assets = $assets_stmt->fetch()['total'];

            // Get total audits
            $audits_query = "SELECT COUNT(*) as total FROM audits WHERE status IN ('scheduled', 'in_progress')";
            $audits_stmt = $this->db->prepare($audits_query);
            $audits_stmt->execute();
            $total_audits = $audits_stmt->fetch()['total'];

            // Get pending vulnerabilities
            $vuln_query = "SELECT COUNT(*) as total FROM vulnerabilities WHERE status IN ('open', 'in_progress')";
            $vuln_stmt = $this->db->prepare($vuln_query);
            $vuln_stmt->execute();
            $pending_vulnerabilities = $vuln_stmt->fetch()['total'];

            // Get critical vulnerabilities
            $critical_query = "SELECT COUNT(*) as total FROM vulnerabilities WHERE severity = 'critical' AND status IN ('open', 'in_progress')";
            $critical_stmt = $this->db->prepare($critical_query);
            $critical_stmt->execute();
            $critical_vulnerabilities = $critical_stmt->fetch()['total'];

            // Get high vulnerabilities
            $high_query = "SELECT COUNT(*) as total FROM vulnerabilities WHERE severity = 'high' AND status IN ('open', 'in_progress')";
            $high_stmt = $this->db->prepare($high_query);
            $high_stmt->execute();
            $high_vulnerabilities = $high_stmt->fetch()['total'];

            // Get overdue tasks (vulnerabilities past due date)
            $overdue_query = "SELECT COUNT(*) as total FROM vulnerabilities WHERE due_date < CURDATE() AND status IN ('open', 'in_progress')";
            $overdue_stmt = $this->db->prepare($overdue_query);
            $overdue_stmt->execute();
            $overdue_tasks = $overdue_stmt->fetch()['total'];

            // Calculate compliance score (simplified)
            $resolved_query = "SELECT COUNT(*) as resolved FROM vulnerabilities WHERE status = 'resolved'";
            $resolved_stmt = $this->db->prepare($resolved_query);
            $resolved_stmt->execute();
            $resolved_vulns = $resolved_stmt->fetch()['resolved'];

            $total_vulns_query = "SELECT COUNT(*) as total FROM vulnerabilities";
            $total_vulns_stmt = $this->db->prepare($total_vulns_query);
            $total_vulns_stmt->execute();
            $total_vulns = $total_vulns_stmt->fetch()['total'];

            $compliance_score = $total_vulns > 0 ? round(($resolved_vulns / $total_vulns) * 100) : 100;

            // Calculate audit coverage
            $audited_assets_query = "SELECT COUNT(DISTINCT asset_id) as audited FROM audit_assets";
            $audited_assets_stmt = $this->db->prepare($audited_assets_query);
            $audited_assets_stmt->execute();
            $audited_assets = $audited_assets_stmt->fetch()['audited'];

            $audit_coverage = $total_assets > 0 ? round(($audited_assets / $total_assets) * 100) : 0;

            $metrics = [
                'totalAssets' => (int)$total_assets,
                'totalAudits' => (int)$total_audits,
                'pendingVulnerabilities' => (int)$pending_vulnerabilities,
                'criticalVulnerabilities' => (int)$critical_vulnerabilities,
                'highVulnerabilities' => (int)$high_vulnerabilities,
                'overdueTasks' => (int)$overdue_tasks,
                'complianceScore' => (int)$compliance_score,
                'auditCoverage' => (int)$audit_coverage
            ];

            http_response_code(200);
            echo json_encode($metrics);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch metrics: ' . $e->getMessage()]);
        }
    }

    public function getActivity() {
        try {
            $query = "SELECT al.*, u.name as user_name 
                      FROM activity_logs al 
                      LEFT JOIN users u ON al.user_id = u.id 
                      ORDER BY al.created_at DESC 
                      LIMIT 20";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            $activities = $stmt->fetchAll();

            // Format activities for frontend
            $formatted_activities = array_map(function($activity) {
                return [
                    'id' => $activity['id'],
                    'type' => $activity['action'],
                    'title' => $this->formatActivityTitle($activity['action'], $activity['entity_type']),
                    'description' => $activity['details'] ?? 'System activity',
                    'timestamp' => $activity['created_at'],
                    'user' => $activity['user_name'] ?? 'System',
                    'severity' => $this->getActivitySeverity($activity['action'])
                ];
            }, $activities);

            http_response_code(200);
            echo json_encode($formatted_activities);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch activity: ' . $e->getMessage()]);
        }
    }

    public function getChartData() {
        try {
            $data = [
                'vulnerabilityTrend' => $this->getVulnerabilityTrendData(),
                'complianceScore' => $this->getComplianceScoreData(),
                'assetDistribution' => $this->getAssetDistributionData(),
                'auditProgress' => $this->getAuditProgressData()
            ];

            http_response_code(200);
            echo json_encode($data);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch chart data: ' . $e->getMessage()]);
        }
    }

    private function getVulnerabilityTrendData() {
        $data = [];
        for ($i = 29; $i >= 0; $i--) {
            $date = date('Y-m-d', strtotime("-$i days"));
            
            $query = "SELECT 
                        SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical,
                        SUM(CASE WHEN severity = 'high' THEN 1 ELSE 0 END) as high,
                        SUM(CASE WHEN severity = 'medium' THEN 1 ELSE 0 END) as medium,
                        SUM(CASE WHEN severity = 'low' THEN 1 ELSE 0 END) as low
                      FROM vulnerabilities 
                      WHERE DATE(discovered_date) = :date";
            
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':date', $date);
            $stmt->execute();
            $result = $stmt->fetch();
            
            $data[] = [
                'date' => $date,
                'critical' => (int)($result['critical'] ?? 0),
                'high' => (int)($result['high'] ?? 0),
                'medium' => (int)($result['medium'] ?? 0),
                'low' => (int)($result['low'] ?? 0)
            ];
        }
        
        return $data;
    }

    private function getComplianceScoreData() {
        $data = [];
        for ($i = 11; $i >= 0; $i--) {
            $date = date('Y-m-01', strtotime("-$i months"));
            
            // Calculate actual compliance score for the month
            $query = "SELECT 
                        COUNT(*) as total_vulns,
                        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_vulns
                      FROM vulnerabilities 
                      WHERE DATE_FORMAT(discovered_date, '%Y-%m') <= :month";
            
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':month', date('Y-m', strtotime($date)));
            $stmt->execute();
            $result = $stmt->fetch();
            
            $total = $result['total_vulns'] ?? 0;
            $resolved = $result['resolved_vulns'] ?? 0;
            $score = $total > 0 ? round(($resolved / $total) * 100) : 100;
            
            $data[] = [
                'date' => $date,
                'score' => $score
            ];
        }
        
        return $data;
    }

    private function getAssetDistributionData() {
        $query = "SELECT type, COUNT(*) as count FROM assets GROUP BY type";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        $results = $stmt->fetchAll();
        
        $type_names = [
            'web_app' => 'Web Apps',
            'server' => 'Servers',
            'database' => 'Databases',
            'endpoint' => 'Endpoints',
            'network_device' => 'Network Devices'
        ];
        
        return array_map(function($item) use ($type_names) {
            return [
                'name' => $type_names[$item['type']] ?? $item['type'],
                'value' => (int)$item['count']
            ];
        }, $results);
    }

    private function getAuditProgressData() {
        $data = [];
        
        for ($i = 5; $i >= 0; $i--) {
            $month = date('Y-m', strtotime("-$i months"));
            $monthName = date('M', strtotime("-$i months"));
            
            $query = "SELECT 
                        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
                        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as inProgress,
                        SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) as scheduled
                      FROM audits 
                      WHERE DATE_FORMAT(scheduled_date, '%Y-%m') = :month";
            
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':month', $month);
            $stmt->execute();
            $result = $stmt->fetch();
            
            $data[] = [
                'month' => $monthName,
                'completed' => (int)($result['completed'] ?? 0),
                'inProgress' => (int)($result['inProgress'] ?? 0),
                'scheduled' => (int)($result['scheduled'] ?? 0)
            ];
        }
        
        return $data;
    }

    private function formatActivityTitle($action, $entity_type) {
        $titles = [
            'create' => 'Created new ' . $entity_type,
            'update' => 'Updated ' . $entity_type,
            'delete' => 'Deleted ' . $entity_type,
            'scan' => 'Started security scan',
            'complete' => 'Completed audit'
        ];
        
        return $titles[$action] ?? ucfirst($action) . ' ' . $entity_type;
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
}