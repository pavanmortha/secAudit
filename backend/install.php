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
    
    // Check PHP extensions
    echo "Checking PHP extensions...\n";
    $required_extensions = ['pdo', 'pdo_mysql', 'json', 'mbstring'];
    $missing_extensions = [];
    
    foreach ($required_extensions as $ext) {
        if (!extension_loaded($ext)) {
            $missing_extensions[] = $ext;
        }
    }
    
    if (!empty($missing_extensions)) {
        echo "❌ Missing required PHP extensions: " . implode(', ', $missing_extensions) . "\n";
        echo "Please install the missing extensions and try again.\n";
        exit(1);
    }
    echo "✓ All required PHP extensions are installed\n\n";

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
    
    // Seed sample data
    echo "Seeding sample data...\n";
    $database->seedData();
    echo "✓ Sample data created successfully\n\n";
    
    // Install Composer dependencies if composer.json exists
    if (file_exists('composer.json')) {
        echo "Installing Composer dependencies...\n";
        $output = [];
        $return_var = 0;
        exec('composer install --no-dev --optimize-autoloader 2>&1', $output, $return_var);
        
        if ($return_var === 0) {
            echo "✓ Composer dependencies installed successfully\n\n";
        } else {
            echo "⚠ Failed to install Composer dependencies automatically\n";
            echo "Please run 'composer install' manually\n\n";
        }
    }
    
    echo "\n=== Installation Complete! ===\n\n";
    echo "Backend server is ready to use.\n";
    echo "Default login credentials:\n";
    echo "• Admin: admin@secaudit.com / admin123\n";
    echo "• Auditor: auditor@secaudit.com / auditor123\n";
    echo "• Auditee: auditee@secaudit.com / auditee123\n\n";
    
    echo "To start the services:\n";
    echo "1. Backend API server: php -S localhost:8000\n";
    echo "2. WebSocket server: php start-websocket.php\n\n";
    
    echo "Frontend should connect to: http://localhost:8000/api\n";
    echo "WebSocket server will run on: ws://localhost:8080\n\n";
    
    echo "For development with real-time features:\n";
    echo "1. Start backend: php -S localhost:8000\n";
    echo "2. Start WebSocket: php start-websocket.php\n";
    echo "3. Start frontend: npm run dev\n";
    
} catch (Exception $e) {
    echo "❌ Installation failed: " . $e->getMessage() . "\n";
    echo "\nPlease check:\n";
    echo "1. Database connection settings in .env\n";
    echo "2. MySQL server is running\n";
    echo "3. Database 'secaudit_pro' exists\n";
    echo "4. PHP has required extensions (pdo_mysql)\n";
    echo "5. Composer is installed (for WebSocket dependencies)\n";
    exit(1);
}