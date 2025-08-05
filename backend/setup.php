<?php
require_once 'config/database.php';

try {
    echo "Setting up SecAudit Pro database...\n";
    
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        throw new Exception("Failed to connect to database");
    }
    
    echo "Creating database tables...\n";
    $database->createTables();
    
    echo "Inserting sample data...\n";
    
    // Create default admin user
    $admin_password = password_hash('admin123', PASSWORD_DEFAULT);
    $admin_query = "INSERT INTO users (name, email, password, role, department) 
                    VALUES ('Admin User', 'admin@secaudit.com', :password, 'admin', 'IT Security')
                    ON DUPLICATE KEY UPDATE name = name";
    $admin_stmt = $db->prepare($admin_query);
    $admin_stmt->bindParam(':password', $admin_password);
    $admin_stmt->execute();
    
    // Create sample auditor
    $auditor_password = password_hash('auditor123', PASSWORD_DEFAULT);
    $auditor_query = "INSERT INTO users (name, email, password, role, department) 
                      VALUES ('John Auditor', 'auditor@secaudit.com', :password, 'auditor', 'Security')
                      ON DUPLICATE KEY UPDATE name = name";
    $auditor_stmt = $db->prepare($auditor_query);
    $auditor_stmt->bindParam(':password', $auditor_password);
    $auditor_stmt->execute();
    
    // Create sample auditee
    $auditee_password = password_hash('auditee123', PASSWORD_DEFAULT);
    $auditee_query = "INSERT INTO users (name, email, password, role, department) 
                      VALUES ('Jane Developer', 'auditee@secaudit.com', :password, 'auditee', 'Development')
                      ON DUPLICATE KEY UPDATE name = name";
    $auditee_stmt = $db->prepare($auditee_query);
    $auditee_stmt->bindParam(':password', $auditee_password);
    $auditee_stmt->execute();
    
    // Create sample assets
    $assets = [
        ['Web Application Server', 'server', '192.168.1.10', 'Ubuntu 20.04', '20.04.3', 'critical', 'John Smith', 'IT', 'Data Center A'],
        ['Customer Portal', 'web_app', '192.168.1.20', 'CentOS 8', '8.5', 'high', 'Jane Doe', 'Development', 'Cloud AWS'],
        ['Database Server', 'database', '192.168.1.30', 'RHEL 8.5', '8.5', 'critical', 'Mike Johnson', 'Database', 'Data Center B']
    ];
    
    $asset_query = "INSERT INTO assets (name, type, ip, os, version, criticality, owner, department, location) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE name = name";
    $asset_stmt = $db->prepare($asset_query);
    
    foreach ($assets as $asset) {
        $asset_stmt->execute($asset);
    }
    
    echo "Database setup completed successfully!\n";
    echo "\nDefault login credentials:\n";
    echo "Admin: admin@secaudit.com / admin123\n";
    echo "Auditor: auditor@secaudit.com / auditor123\n";
    echo "Auditee: auditee@secaudit.com / auditee123\n";
    
} catch (Exception $e) {
    echo "Setup failed: " . $e->getMessage() . "\n";
    exit(1);
}