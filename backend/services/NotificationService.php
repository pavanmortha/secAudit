<?php
require_once __DIR__ . '/EmailService.php';

class NotificationService {
    private $db;
    private $emailService;

    public function __construct($db) {
        $this->db = $db;
        $this->emailService = new EmailService();
    }

    public function sendVulnerabilityAlert($vulnerabilityId) {
        try {
            // Get vulnerability details
            $query = "SELECT v.*, a.name as asset_name, u.email as assigned_email 
                      FROM vulnerabilities v 
                      LEFT JOIN assets a ON v.asset_id = a.id 
                      LEFT JOIN users u ON v.assigned_to = u.id 
                      WHERE v.id = :id";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id', $vulnerabilityId);
            $stmt->execute();
            $vulnerability = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$vulnerability) {
                return false;
            }

            // Send email to assigned user
            if ($vulnerability['assigned_email']) {
                $this->emailService->sendVulnerabilityAlert(
                    $vulnerability['assigned_email'], 
                    $vulnerability
                );
            }

            // Send to all admins if critical
            if ($vulnerability['severity'] === 'critical') {
                $adminQuery = "SELECT email FROM users WHERE role = 'admin'";
                $adminStmt = $this->db->prepare($adminQuery);
                $adminStmt->execute();
                $admins = $adminStmt->fetchAll(PDO::FETCH_ASSOC);

                foreach ($admins as $admin) {
                    $this->emailService->sendVulnerabilityAlert(
                        $admin['email'], 
                        $vulnerability
                    );
                }
            }

            return true;
        } catch (Exception $e) {
            error_log("Failed to send vulnerability alert: " . $e->getMessage());
            return false;
        }
    }

    public function sendAuditReminder($auditId) {
        try {
            // Get audit details
            $query = "SELECT a.*, u1.email as auditor_email, u2.email as auditee_email 
                      FROM audits a 
                      LEFT JOIN users u1 ON a.auditor_id = u1.id 
                      LEFT JOIN users u2 ON a.auditee_id = u2.id 
                      WHERE a.id = :id";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id', $auditId);
            $stmt->execute();
            $audit = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$audit) {
                return false;
            }

            // Send to auditor and auditee
            if ($audit['auditor_email']) {
                $this->emailService->sendAuditReminder($audit['auditor_email'], $audit);
            }
            if ($audit['auditee_email']) {
                $this->emailService->sendAuditReminder($audit['auditee_email'], $audit);
            }

            return true;
        } catch (Exception $e) {
            error_log("Failed to send audit reminder: " . $e->getMessage());
            return false;
        }
    }

    public function createInAppNotification($userId, $type, $title, $message, $data = null) {
        try {
            $query = "INSERT INTO notifications (user_id, type, title, message, data, created_at) 
                      VALUES (:user_id, :type, :title, :message, :data, NOW())";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':user_id', $userId);
            $stmt->bindParam(':type', $type);
            $stmt->bindParam(':title', $title);
            $stmt->bindParam(':message', $message);
            $stmt->bindParam(':data', $data ? json_encode($data) : null);
            
            return $stmt->execute();
        } catch (Exception $e) {
            error_log("Failed to create notification: " . $e->getMessage());
            return false;
        }
    }

    public function getUserNotifications($userId, $limit = 20) {
        try {
            $query = "SELECT * FROM notifications 
                      WHERE user_id = :user_id 
                      ORDER BY created_at DESC 
                      LIMIT :limit";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':user_id', $userId);
            $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Failed to get notifications: " . $e->getMessage());
            return [];
        }
    }

    public function markNotificationAsRead($notificationId, $userId) {
        try {
            $query = "UPDATE notifications SET read_at = NOW() 
                      WHERE id = :id AND user_id = :user_id";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id', $notificationId);
            $stmt->bindParam(':user_id', $userId);
            
            return $stmt->execute();
        } catch (Exception $e) {
            error_log("Failed to mark notification as read: " . $e->getMessage());
            return false;
        }
    }
}