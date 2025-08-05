<?php
require_once __DIR__ . '/../vendor/autoload.php';

// Load environment variables
if (file_exists(__DIR__ . '/../.env')) {
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
    $dotenv->load();
}

class Database {
    private $host;
    private $db_name;
    private $username;
    private $password;
    public $conn;

    public function __construct() {
        $this->host = $_ENV['DB_HOST'] ?? 'localhost';
        $this->db_name = $_ENV['DB_NAME'] ?? 'secaudit_pro';
        $this->username = $_ENV['DB_USER'] ?? 'root';
        $this->password = $_ENV['DB_PASS'] ?? '';
    }

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
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
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
                INDEX idx_email (email),
                INDEX idx_role (role)
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
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_type (type),
                INDEX idx_criticality (criticality),
                INDEX idx_status (status),
                INDEX idx_ip (ip)
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
                FOREIGN KEY (auditee_id) REFERENCES users(id),
                INDEX idx_status (status),
                INDEX idx_type (type),
                INDEX idx_scheduled_date (scheduled_date)
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
                FOREIGN KEY (assigned_to) REFERENCES users(id),
                INDEX idx_severity (severity),
                INDEX idx_status (status),
                INDEX idx_discovered_date (discovered_date),
                INDEX idx_cvss_score (cvss_score)
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
                FOREIGN KEY (generated_by) REFERENCES users(id),
                INDEX idx_type (type),
                INDEX idx_status (status),
                INDEX idx_generated_date (generated_date)
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
                FOREIGN KEY (user_id) REFERENCES users(id),
                INDEX idx_created_at (created_at),
                INDEX idx_action (action),
                INDEX idx_entity_type (entity_type)
            )",
            
            "CREATE TABLE IF NOT EXISTS scan_sessions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                asset_id INT NOT NULL,
                status ENUM('running', 'completed', 'failed') NOT NULL DEFAULT 'running',
                progress INT DEFAULT 0,
                stage VARCHAR(255),
                findings_count INT DEFAULT 0,
                started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                completed_at TIMESTAMP NULL,
                FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
                INDEX idx_asset_id (asset_id),
                INDEX idx_status (status),
                INDEX idx_started_at (started_at)
            )",
            
            "CREATE TABLE IF NOT EXISTS websocket_connections (
                id VARCHAR(255) PRIMARY KEY,
                user_id INT NULL,
                connected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_ping TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
                INDEX idx_user_id (user_id),
                INDEX idx_last_ping (last_ping)
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
    
    public function seedData() {
        // Create default users if they don't exist
        $users = [
            [
                'name' => 'Admin User',
                'email' => 'admin@secaudit.com',
                'password' => password_hash('admin123', PASSWORD_DEFAULT),
                'role' => 'admin',
                'department' => 'IT Security'
            ],
            [
                'name' => 'John Auditor',
                'email' => 'auditor@secaudit.com',
                'password' => password_hash('auditor123', PASSWORD_DEFAULT),
                'role' => 'auditor',
                'department' => 'Security'
            ],
            [
                'name' => 'Jane Developer',
                'email' => 'auditee@secaudit.com',
                'password' => password_hash('auditee123', PASSWORD_DEFAULT),
                'role' => 'auditee',
                'department' => 'Development'
            ]
        ];

        $user_query = "INSERT IGNORE INTO users (name, email, password, role, department) 
                       VALUES (:name, :email, :password, :role, :department)";
        $user_stmt = $this->conn->prepare($user_query);
        
        foreach ($users as $user) {
            $user_stmt->execute($user);
        }
        
        // Create sample assets
        $assets = [
            [
                'name' => 'Web Application Server',
                'type' => 'server',
                'ip' => '192.168.1.10',
                'os' => 'Ubuntu 20.04',
                'version' => '20.04.3',
                'criticality' => 'critical',
                'owner' => 'John Smith',
                'department' => 'IT',
                'location' => 'Data Center A',
                'status' => 'active'
            ],
            [
                'name' => 'Customer Portal',
                'type' => 'web_app',
                'ip' => '192.168.1.20',
                'os' => 'CentOS 8',
                'version' => '8.5',
                'criticality' => 'high',
                'owner' => 'Jane Doe',
                'department' => 'Development',
                'location' => 'Cloud AWS',
                'status' => 'active'
            ],
            [
                'name' => 'Database Server',
                'type' => 'database',
                'ip' => '192.168.1.30',
                'os' => 'RHEL 8.5',
                'version' => '8.5',
                'criticality' => 'critical',
                'owner' => 'Mike Johnson',
                'department' => 'Database',
                'location' => 'Data Center B',
                'status' => 'active'
            ]
        ];
        
        $asset_query = "INSERT IGNORE INTO assets (name, type, ip, os, version, criticality, owner, department, location, status) 
                        VALUES (:name, :type, :ip, :os, :version, :criticality, :owner, :department, :location, :status)";
        $asset_stmt = $this->conn->prepare($asset_query);
        
        foreach ($assets as $asset) {
            $asset_stmt->execute($asset);
        }
        
        // Create sample vulnerabilities
        $vulnerabilities = [
            [
                'audit_id' => 1,
                'asset_id' => 1,
                'title' => 'SQL Injection in Login Form',
                'description' => 'The login form is vulnerable to SQL injection attacks through the username parameter.',
                'severity' => 'critical',
                'cvss_score' => 9.1,
                'category' => 'Injection',
                'status' => 'open'
            ],
            [
                'audit_id' => 1,
                'asset_id' => 2,
                'title' => 'Outdated SSL/TLS Configuration',
                'description' => 'Server supports deprecated TLS 1.0 and 1.1 protocols.',
                'severity' => 'medium',
                'cvss_score' => 5.3,
                'category' => 'Configuration',
                'status' => 'in_progress'
            ]
        ];
        
        $vuln_query = "INSERT IGNORE INTO vulnerabilities (audit_id, asset_id, title, description, severity, cvss_score, category, status) 
                       VALUES (:audit_id, :asset_id, :title, :description, :severity, :cvss_score, :category, :status)";
        $vuln_stmt = $this->conn->prepare($vuln_query);
        
        foreach ($vulnerabilities as $vuln) {
            $vuln_stmt->execute($vuln);
        }
    }
}