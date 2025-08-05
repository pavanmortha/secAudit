<?php
/**
 * Installation script for SecAudit Pro Backend
 * Run this script to set up the database and initial configuration
 */

require_once 'config/database.php';

echo "=== SecAudit Pro Backend Installation ===\n\n";

try {
    // Check if .env file exists
    if (!file_exists('.env')) {
        echo "Creating .env file from template...\n";
        if (file_exists('.env.example')) {
            copy('.env.example', '.env');
            echo "✓ .env file created. Please update database credentials if needed.\n\n";
        } else {
            echo "⚠ .env.example not found. Please create .env file manually.\n\n";
        }
    }

    // Initialize database connection
    echo "Connecting to database...\n";
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        throw new Exception("Failed to connect to database. Please check your .env configuration.");
    }
    echo "✓ Database connection successful\n\n";
    
    // Create tables
    echo "Creating database tables...\n";
    $database->createTables();
    echo "✓ Database tables created successfully\n\n";
    
    // Insert sample data
    echo "Inserting sample data...\n";
    
    // Create default users
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

    $user_query = "INSERT INTO users (name, email, password, role, department) 
                   VALUES (:name, :email, :password, :role, :department)
                   ON DUPLICATE KEY UPDATE name = VALUES(name)";
    $user_stmt = $db->prepare($user_query);
    
    foreach ($users as $user) {
        $user_stmt->execute($user);
    }
    echo "✓ Default users created\n";
    
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
    
    $asset_query = "INSERT INTO assets (name, type, ip, os, version, criticality, owner, department, location, status) 
                    VALUES (:name, :type, :ip, :os, :version, :criticality, :owner, :department, :location, :status)
                    ON DUPLICATE KEY UPDATE name = VALUES(name)";
    $asset_stmt = $db->prepare($asset_query);
    
    foreach ($assets as $asset) {
        $asset_stmt->execute($asset);
    }
    echo "✓ Sample assets created\n";
    
    // Create sample audit
    $audit_query = "INSERT INTO audits (title, type, scope, auditor_id, auditee_id, scheduled_date, frequency) 
                    VALUES ('Q1 2024 VAPT Assessment', 'vapt', 'Web Application,Network Infrastructure', 2, 3, CURDATE() + INTERVAL 7 DAY, 'quarterly')
                    ON DUPLICATE KEY UPDATE title = VALUES(title)";
    $db->exec($audit_query);
    echo "✓ Sample audit created\n";
    
    // Create sample vulnerabilities
    $vuln_query = "INSERT INTO vulnerabilities (audit_id, asset_id, title, description, severity, cvss_score, category, status) 
                   VALUES 
                   (1, 1, 'SQL Injection in Login Form', 'The login form is vulnerable to SQL injection attacks through the username parameter.', 'critical', 9.1, 'Injection', 'open'),
                   (1, 2, 'Outdated SSL/TLS Configuration', 'Server supports deprecated TLS 1.0 and 1.1 protocols.', 'medium', 5.3, 'Configuration', 'in_progress')
                   ON DUPLICATE KEY UPDATE title = VALUES(title)";
    $db->exec($vuln_query);
    echo "✓ Sample vulnerabilities created\n";
    
    echo "\n=== Installation Complete! ===\n\n";
    echo "Backend server is ready to use.\n";
    echo "Default login credentials:\n";
    echo "• Admin: admin@secaudit.com / admin123\n";
    echo "• Auditor: auditor@secaudit.com / auditor123\n";
    echo "• Auditee: auditee@secaudit.com / auditee123\n\n";
    echo "To start the backend server, run:\n";
    echo "php -S localhost:8000\n\n";
    echo "Frontend should connect to: http://localhost:8000/api\n";
    
} catch (Exception $e) {
    echo "❌ Installation failed: " . $e->getMessage() . "\n";
    echo "\nPlease check:\n";
    echo "1. Database connection settings in .env\n";
    echo "2. MySQL server is running\n";
    echo "3. Database 'secaudit_pro' exists\n";
    echo "4. PHP has required extensions (pdo_mysql)\n";
    exit(1);
}