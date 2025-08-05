<?php
/**
 * Scheduled Tasks for SecAudit Pro
 * Run this script via cron job for automated tasks
 * 
 * Example cron entries:
 * # Run every hour
 * 0 * * * * /usr/bin/php /path/to/backend/cron/scheduled_tasks.php hourly
 * 
 * # Run daily at 2 AM
 * 0 2 * * * /usr/bin/php /path/to/backend/cron/scheduled_tasks.php daily
 * 
 * # Run weekly on Sunday at 3 AM
 * 0 3 * * 0 /usr/bin/php /path/to/backend/cron/scheduled_tasks.php weekly
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../services/NotificationService.php';
require_once __DIR__ . '/../utils/Logger.php';

$task = $argv[1] ?? 'hourly';
$logger = new Logger(__DIR__ . '/../logs/cron.log');

$database = new Database();
$db = $database->getConnection();
$notificationService = new NotificationService($db);

$logger->info("Starting scheduled task: $task");

try {
    switch ($task) {
        case 'hourly':
            runHourlyTasks($db, $notificationService, $logger);
            break;
        case 'daily':
            runDailyTasks($db, $notificationService, $logger);
            break;
        case 'weekly':
            runWeeklyTasks($db, $notificationService, $logger);
            break;
        default:
            $logger->error("Unknown task: $task");
            exit(1);
    }
    
    $logger->info("Completed scheduled task: $task");
} catch (Exception $e) {
    $logger->error("Error in scheduled task $task: " . $e->getMessage());
    exit(1);
}

function runHourlyTasks($db, $notificationService, $logger) {
    // Check for overdue vulnerabilities
    checkOverdueVulnerabilities($db, $notificationService, $logger);
    
    // Clean up old activity logs (keep last 30 days)
    cleanupOldLogs($db, $logger);
    
    // Update scan statuses
    updateScanStatuses($db, $logger);
}

function runDailyTasks($db, $notificationService, $logger) {
    // Send audit reminders
    sendAuditReminders($db, $notificationService, $logger);
    
    // Generate daily metrics
    generateDailyMetrics($db, $logger);
    
    // Backup database (if configured)
    backupDatabase($logger);
    
    // Clean up temporary files
    cleanupTempFiles($logger);
}

function runWeeklyTasks($db, $notificationService, $logger) {
    // Generate weekly reports
    generateWeeklyReports($db, $logger);
    
    // Update compliance scores
    updateComplianceScores($db, $logger);
    
    // Archive old data
    archiveOldData($db, $logger);
}

function checkOverdueVulnerabilities($db, $notificationService, $logger) {
    $query = "SELECT v.*, a.name as asset_name, u.email as assigned_email 
              FROM vulnerabilities v 
              LEFT JOIN assets a ON v.asset_id = a.id 
              LEFT JOIN users u ON v.assigned_to = u.id 
              WHERE v.due_date < CURDATE() 
              AND v.status IN ('open', 'in_progress')
              AND v.notified_overdue = 0";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    $overdueVulns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($overdueVulns as $vuln) {
        // Send notification
        $notificationService->sendVulnerabilityAlert($vuln['id']);
        
        // Mark as notified
        $updateQuery = "UPDATE vulnerabilities SET notified_overdue = 1 WHERE id = :id";
        $updateStmt = $db->prepare($updateQuery);
        $updateStmt->bindParam(':id', $vuln['id']);
        $updateStmt->execute();
        
        $logger->info("Sent overdue notification for vulnerability: " . $vuln['title']);
    }
}

function sendAuditReminders($db, $notificationService, $logger) {
    // Send reminders for audits scheduled in next 7 days
    $query = "SELECT * FROM audits 
              WHERE scheduled_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
              AND status = 'scheduled'
              AND reminder_sent = 0";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    $upcomingAudits = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($upcomingAudits as $audit) {
        $notificationService->sendAuditReminder($audit['id']);
        
        // Mark reminder as sent
        $updateQuery = "UPDATE audits SET reminder_sent = 1 WHERE id = :id";
        $updateStmt = $db->prepare($updateQuery);
        $updateStmt->bindParam(':id', $audit['id']);
        $updateStmt->execute();
        
        $logger->info("Sent audit reminder for: " . $audit['title']);
    }
}

function cleanupOldLogs($db, $logger) {
    $query = "DELETE FROM activity_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $deletedRows = $stmt->rowCount();
    
    $logger->info("Cleaned up $deletedRows old activity log entries");
}

function updateScanStatuses($db, $logger) {
    // Mark old running scans as failed if they've been running too long
    $query = "UPDATE scan_sessions 
              SET status = 'failed' 
              WHERE status = 'running' 
              AND started_at < DATE_SUB(NOW(), INTERVAL 2 HOUR)";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    $updatedRows = $stmt->rowCount();
    
    if ($updatedRows > 0) {
        $logger->info("Marked $updatedRows stale scan sessions as failed");
    }
}

function generateDailyMetrics($db, $logger) {
    // Calculate and store daily metrics
    $metricsQuery = "INSERT INTO daily_metrics (date, total_assets, total_audits, total_vulnerabilities, critical_vulnerabilities, compliance_score) 
                     SELECT 
                         CURDATE(),
                         (SELECT COUNT(*) FROM assets WHERE status = 'active'),
                         (SELECT COUNT(*) FROM audits WHERE status IN ('scheduled', 'in_progress')),
                         (SELECT COUNT(*) FROM vulnerabilities WHERE status IN ('open', 'in_progress')),
                         (SELECT COUNT(*) FROM vulnerabilities WHERE severity = 'critical' AND status IN ('open', 'in_progress')),
                         (SELECT ROUND((SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) / COUNT(*)) * 100) FROM vulnerabilities)
                     ON DUPLICATE KEY UPDATE
                         total_assets = VALUES(total_assets),
                         total_audits = VALUES(total_audits),
                         total_vulnerabilities = VALUES(total_vulnerabilities),
                         critical_vulnerabilities = VALUES(critical_vulnerabilities),
                         compliance_score = VALUES(compliance_score)";
    
    $stmt = $db->prepare($metricsQuery);
    $stmt->execute();
    
    $logger->info("Generated daily metrics");
}

function backupDatabase($logger) {
    $dbHost = $_ENV['DB_HOST'] ?? 'localhost';
    $dbName = $_ENV['DB_NAME'] ?? 'secaudit_pro';
    $dbUser = $_ENV['DB_USER'] ?? 'root';
    $dbPass = $_ENV['DB_PASS'] ?? '';
    
    $backupDir = __DIR__ . '/../backups/';
    if (!is_dir($backupDir)) {
        mkdir($backupDir, 0755, true);
    }
    
    $backupFile = $backupDir . 'backup_' . date('Y-m-d_H-i-s') . '.sql';
    $command = "mysqldump -h$dbHost -u$dbUser -p$dbPass $dbName > $backupFile";
    
    exec($command, $output, $returnCode);
    
    if ($returnCode === 0) {
        $logger->info("Database backup created: $backupFile");
        
        // Keep only last 7 backups
        $backups = glob($backupDir . 'backup_*.sql');
        if (count($backups) > 7) {
            sort($backups);
            $oldBackups = array_slice($backups, 0, -7);
            foreach ($oldBackups as $oldBackup) {
                unlink($oldBackup);
            }
        }
    } else {
        $logger->error("Database backup failed");
    }
}

function cleanupTempFiles($logger) {
    $tempDir = __DIR__ . '/../temp/';
    if (is_dir($tempDir)) {
        $files = glob($tempDir . '*');
        $deletedCount = 0;
        
        foreach ($files as $file) {
            if (is_file($file) && filemtime($file) < strtotime('-1 day')) {
                unlink($file);
                $deletedCount++;
            }
        }
        
        if ($deletedCount > 0) {
            $logger->info("Cleaned up $deletedCount temporary files");
        }
    }
}

function generateWeeklyReports($db, $logger) {
    // Auto-generate weekly summary reports
    require_once __DIR__ . '/../services/ReportGeneratorService.php';
    
    $reportGenerator = new ReportGeneratorService($db);
    $reportData = $reportGenerator->generateAuditSummaryReport(['dateRange' => 7]);
    
    // Save report to database
    $query = "INSERT INTO reports (title, type, generated_by, status, file_path, format) 
              VALUES (:title, :type, :generated_by, :status, :file_path, :format)";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':title', 'Weekly Audit Summary - ' . date('Y-m-d'));
    $stmt->bindParam(':type', 'audit_summary');
    $stmt->bindParam(':generated_by', 1); // System user
    $stmt->bindParam(':status', 'final');
    $stmt->bindParam(':file_path', 'reports/weekly_' . date('Y-m-d') . '.json');
    $stmt->bindParam(':format', 'json');
    $stmt->execute();
    
    $logger->info("Generated weekly audit summary report");
}

function updateComplianceScores($db, $logger) {
    // Recalculate compliance scores for all assets
    $query = "UPDATE assets a 
              SET compliance_score = (
                  SELECT COALESCE(
                      ROUND((SUM(CASE WHEN v.status = 'resolved' THEN 1 ELSE 0 END) / COUNT(v.id)) * 100), 
                      100
                  )
                  FROM vulnerabilities v 
                  WHERE v.asset_id = a.id
              )";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $logger->info("Updated compliance scores for all assets");
}

function archiveOldData($db, $logger) {
    // Archive vulnerabilities older than 1 year that are resolved
    $archiveQuery = "INSERT INTO vulnerabilities_archive 
                     SELECT * FROM vulnerabilities 
                     WHERE status = 'resolved' 
                     AND resolved_date < DATE_SUB(NOW(), INTERVAL 1 YEAR)";
    
    $stmt = $db->prepare($archiveQuery);
    $stmt->execute();
    $archivedCount = $stmt->rowCount();
    
    if ($archivedCount > 0) {
        // Delete archived vulnerabilities from main table
        $deleteQuery = "DELETE FROM vulnerabilities 
                        WHERE status = 'resolved' 
                        AND resolved_date < DATE_SUB(NOW(), INTERVAL 1 YEAR)";
        
        $deleteStmt = $db->prepare($deleteQuery);
        $deleteStmt->execute();
        
        $logger->info("Archived $archivedCount old resolved vulnerabilities");
    }
}