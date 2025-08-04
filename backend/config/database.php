<?php
class Database {
    private $host = "localhost";
    private $db_name = "secaudit_pro";
    private $username = "root";
    private $password = "";
    public $conn;

    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password
            );
            $this->conn->exec("set names utf8");
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $exception) {
            echo "Connection error: " . $exception->getMessage();
        }

        return $this->conn;
    }

    public function createTables() {
        $queries = [
            "CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role ENUM('admin', 'auditor', 'auditee') NOT NULL,
                department VARCHAR(255),
                phone VARCHAR(20),
                last_login TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )",
            
            "CREATE TABLE IF NOT EXISTS assets (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                type ENUM('web_app', 'server', 'database', 'endpoint', 'network_device') NOT NULL,
                ip VARCHAR(45) NOT NULL,
                os VARCHAR(255) NOT NULL,
                version VARCHAR(100),
                criticality ENUM('critical', 'high', 'medium', 'low') NOT NULL,
                owner VARCHAR(255) NOT NULL,
                department VARCHAR(255) NOT NULL,
                location VARCHAR(255),
                status ENUM('active', 'inactive', 'maintenance') NOT NULL DEFAULT 'active',
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )",
            
            "CREATE TABLE IF NOT EXISTS audits (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                type ENUM('vapt', 'config_audit', 'red_team', 'code_review') NOT NULL,
                scope TEXT NOT NULL,
                auditor_id INT NOT NULL,
                auditee_id INT NOT NULL,
                status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') NOT NULL DEFAULT 'scheduled',
                scheduled_date DATE NOT NULL,
                completed_date DATE NULL,
                frequency ENUM('quarterly', 'annually', 'one_time') NOT NULL,
                documents TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (auditor_id) REFERENCES users(id),
                FOREIGN KEY (auditee_id) REFERENCES users(id)
            )",
            
            "CREATE TABLE IF NOT EXISTS audit_assets (
                id INT AUTO_INCREMENT PRIMARY KEY,
                audit_id INT NOT NULL,
                asset_id INT NOT NULL,
                FOREIGN KEY (audit_id) REFERENCES audits(id) ON DELETE CASCADE,
                FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
                UNIQUE KEY unique_audit_asset (audit_id, asset_id)
            )",
            
            "CREATE TABLE IF NOT EXISTS vulnerabilities (
                id INT AUTO_INCREMENT PRIMARY KEY,
                audit_id INT NOT NULL,
                asset_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                severity ENUM('critical', 'high', 'medium', 'low', 'info') NOT NULL,
                cvss_score DECIMAL(3,1) NOT NULL,
                epss_score DECIMAL(4,3) NULL,
                cve_id VARCHAR(20) NULL,
                category VARCHAR(100) NOT NULL,
                status ENUM('open', 'in_progress', 'resolved', 'false_positive') NOT NULL DEFAULT 'open',
                assigned_to INT NULL,
                due_date DATE NULL,
                root_cause TEXT NULL,
                remediation TEXT NULL,
                evidence TEXT NULL,
                discovered_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                resolved_date TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (audit_id) REFERENCES audits(id),
                FOREIGN KEY (asset_id) REFERENCES assets(id),
                FOREIGN KEY (assigned_to) REFERENCES users(id)
            )",
            
            "CREATE TABLE IF NOT EXISTS reports (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                type ENUM('audit_summary', 'vulnerability_report', 'compliance_report', 'executive_summary') NOT NULL,
                audit_id INT NULL,
                generated_by INT NOT NULL,
                status ENUM('draft', 'final', 'approved') NOT NULL DEFAULT 'draft',
                file_path VARCHAR(500),
                file_size VARCHAR(20),
                format ENUM('pdf', 'html', 'xlsx') NOT NULL DEFAULT 'pdf',
                generated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (audit_id) REFERENCES audits(id),
                FOREIGN KEY (generated_by) REFERENCES users(id)
            )",
            
            "CREATE TABLE IF NOT EXISTS activity_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NULL,
                action VARCHAR(100) NOT NULL,
                entity_type VARCHAR(50) NOT NULL,
                entity_id INT NOT NULL,
                details TEXT NULL,
                ip_address VARCHAR(45),
                user_agent TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )"
        ];

        foreach ($queries as $query) {
            try {
                $this->conn->exec($query);
            } catch(PDOException $e) {
                throw new Exception("Error creating table: " . $e->getMessage());
            }
        }
    }
}