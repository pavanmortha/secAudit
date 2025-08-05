<?php
class ReportGeneratorService {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function generateAuditSummaryReport($params = []) {
        $dateRange = $params['dateRange'] ?? 30;
        $includeCharts = $params['includeCharts'] ?? true;
        $includeDetails = $params['includeDetails'] ?? true;

        $data = [
            'title' => 'Audit Summary Report',
            'generated_date' => date('Y-m-d H:i:s'),
            'date_range' => $dateRange,
            'summary' => $this->getAuditSummary($dateRange),
            'audits' => $this->getRecentAudits($dateRange),
            'vulnerabilities' => $this->getVulnerabilitySummary($dateRange),
            'assets' => $this->getAssetSummary(),
            'compliance' => $this->getComplianceMetrics()
        ];

        if ($includeCharts) {
            $data['charts'] = $this->generateChartData($dateRange);
        }

        return $data;
    }

    public function generateVulnerabilityReport($params = []) {
        $dateRange = $params['dateRange'] ?? 30;
        $severity = $params['severity'] ?? 'all';

        $data = [
            'title' => 'Vulnerability Assessment Report',
            'generated_date' => date('Y-m-d H:i:s'),
            'date_range' => $dateRange,
            'summary' => $this->getVulnerabilitySummary($dateRange, $severity),
            'vulnerabilities' => $this->getDetailedVulnerabilities($dateRange, $severity),
            'trends' => $this->getVulnerabilityTrends($dateRange),
            'recommendations' => $this->getSecurityRecommendations()
        ];

        return $data;
    }

    public function generateComplianceReport($params = []) {
        $framework = $params['framework'] ?? 'cert-in';

        $data = [
            'title' => 'Compliance Status Report',
            'generated_date' => date('Y-m-d H:i:s'),
            'framework' => $framework,
            'compliance_score' => $this->calculateComplianceScore(),
            'audit_coverage' => $this->calculateAuditCoverage(),
            'requirements' => $this->getComplianceRequirements($framework),
            'gaps' => $this->identifyComplianceGaps($framework),
            'recommendations' => $this->getComplianceRecommendations($framework)
        ];

        return $data;
    }

    public function generateExecutiveSummary($params = []) {
        $data = [
            'title' => 'Executive Security Summary',
            'generated_date' => date('Y-m-d H:i:s'),
            'overview' => $this->getSecurityOverview(),
            'key_metrics' => $this->getKeySecurityMetrics(),
            'risk_assessment' => $this->getRiskAssessment(),
            'recent_incidents' => $this->getRecentSecurityIncidents(),
            'recommendations' => $this->getExecutiveRecommendations(),
            'budget_impact' => $this->getBudgetImpactAnalysis()
        ];

        return $data;
    }

    private function getAuditSummary($dateRange) {
        $query = "SELECT 
                    COUNT(*) as total_audits,
                    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_audits,
                    SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_audits,
                    SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) as scheduled_audits
                  FROM audits 
                  WHERE scheduled_date >= DATE_SUB(NOW(), INTERVAL :days DAY)";
        
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':days', $dateRange);
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    private function getVulnerabilitySummary($dateRange, $severity = 'all') {
        $whereClause = "WHERE discovered_date >= DATE_SUB(NOW(), INTERVAL :days DAY)";
        if ($severity !== 'all') {
            $whereClause .= " AND severity = :severity";
        }

        $query = "SELECT 
                    COUNT(*) as total_vulnerabilities,
                    SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical,
                    SUM(CASE WHEN severity = 'high' THEN 1 ELSE 0 END) as high,
                    SUM(CASE WHEN severity = 'medium' THEN 1 ELSE 0 END) as medium,
                    SUM(CASE WHEN severity = 'low' THEN 1 ELSE 0 END) as low,
                    SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
                    SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open
                  FROM vulnerabilities $whereClause";
        
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':days', $dateRange);
        if ($severity !== 'all') {
            $stmt->bindParam(':severity', $severity);
        }
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    private function getAssetSummary() {
        $query = "SELECT 
                    COUNT(*) as total_assets,
                    SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_assets,
                    SUM(CASE WHEN criticality = 'critical' THEN 1 ELSE 0 END) as critical_assets,
                    SUM(CASE WHEN criticality = 'high' THEN 1 ELSE 0 END) as high_assets
                  FROM assets";
        
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    private function getComplianceMetrics() {
        // Calculate compliance score based on resolved vulnerabilities
        $query = "SELECT 
                    COUNT(*) as total_vulns,
                    SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_vulns
                  FROM vulnerabilities";
        
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $complianceScore = $result['total_vulns'] > 0 ? 
            round(($result['resolved_vulns'] / $result['total_vulns']) * 100) : 100;

        return [
            'compliance_score' => $complianceScore,
            'total_vulnerabilities' => $result['total_vulns'],
            'resolved_vulnerabilities' => $result['resolved_vulns']
        ];
    }

    private function calculateComplianceScore() {
        // Implement CERT-In compliance scoring logic
        $metrics = $this->getComplianceMetrics();
        return $metrics['compliance_score'];
    }

    private function calculateAuditCoverage() {
        $query = "SELECT 
                    (SELECT COUNT(DISTINCT asset_id) FROM audit_assets) as audited_assets,
                    (SELECT COUNT(*) FROM assets WHERE status = 'active') as total_assets";
        
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return $result['total_assets'] > 0 ? 
            round(($result['audited_assets'] / $result['total_assets']) * 100) : 0;
    }

    private function getSecurityRecommendations() {
        return [
            'Implement regular vulnerability scanning',
            'Establish incident response procedures',
            'Conduct security awareness training',
            'Update security policies and procedures',
            'Implement multi-factor authentication',
            'Regular backup and recovery testing'
        ];
    }

    private function getComplianceRecommendations($framework) {
        $recommendations = [
            'cert-in' => [
                'Implement CERT-In guidelines for incident reporting',
                'Establish 24/7 security monitoring',
                'Conduct regular security assessments',
                'Implement data protection measures',
                'Establish business continuity plans'
            ]
        ];

        return $recommendations[$framework] ?? $recommendations['cert-in'];
    }

    public function exportToPDF($data, $template = 'default') {
        // In production, use libraries like TCPDF or DOMPDF
        // For now, return HTML that can be converted to PDF
        return $this->generateHTMLReport($data, $template);
    }

    public function exportToExcel($data) {
        // In production, use PhpSpreadsheet
        // For now, return CSV format
        return $this->generateCSVReport($data);
    }

    private function generateHTMLReport($data, $template) {
        $html = "
        <!DOCTYPE html>
        <html>
        <head>
            <title>{$data['title']}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                .header { text-align: center; margin-bottom: 30px; }
                .section { margin-bottom: 25px; }
                .metric { display: inline-block; margin: 10px; padding: 15px; border: 1px solid #ddd; }
                table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
            </style>
        </head>
        <body>
            <div class='header'>
                <h1>{$data['title']}</h1>
                <p>Generated on: {$data['generated_date']}</p>
            </div>
        ";

        // Add content based on report type
        if (isset($data['summary'])) {
            $html .= "<div class='section'><h2>Summary</h2>";
            foreach ($data['summary'] as $key => $value) {
                $html .= "<div class='metric'><strong>" . ucwords(str_replace('_', ' ', $key)) . ":</strong> $value</div>";
            }
            $html .= "</div>";
        }

        $html .= "</body></html>";
        return $html;
    }

    private function generateCSVReport($data) {
        $csv = "Report: {$data['title']}\n";
        $csv .= "Generated: {$data['generated_date']}\n\n";
        
        if (isset($data['summary'])) {
            $csv .= "Summary\n";
            foreach ($data['summary'] as $key => $value) {
                $csv .= ucwords(str_replace('_', ' ', $key)) . ",$value\n";
            }
        }
        
        return $csv;
    }
}