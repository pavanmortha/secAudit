<?php
class EmailService {
    private $host;
    private $port;
    private $username;
    private $password;
    private $fromAddress;
    private $fromName;

    public function __construct() {
        $this->host = $_ENV['MAIL_HOST'] ?? 'localhost';
        $this->port = $_ENV['MAIL_PORT'] ?? 587;
        $this->username = $_ENV['MAIL_USERNAME'] ?? '';
        $this->password = $_ENV['MAIL_PASSWORD'] ?? '';
        $this->fromAddress = $_ENV['MAIL_FROM_ADDRESS'] ?? 'noreply@secaudit.com';
        $this->fromName = $_ENV['MAIL_FROM_NAME'] ?? 'SecAudit Pro';
    }

    public function sendVulnerabilityAlert($to, $vulnerability) {
        $subject = "Critical Vulnerability Alert: " . $vulnerability['title'];
        $body = $this->buildVulnerabilityAlertTemplate($vulnerability);
        
        return $this->sendEmail($to, $subject, $body);
    }

    public function sendAuditReminder($to, $audit) {
        $subject = "Audit Reminder: " . $audit['title'];
        $body = $this->buildAuditReminderTemplate($audit);
        
        return $this->sendEmail($to, $subject, $body);
    }

    public function sendReportGenerated($to, $report) {
        $subject = "Report Generated: " . $report['title'];
        $body = $this->buildReportGeneratedTemplate($report);
        
        return $this->sendEmail($to, $subject, $body);
    }

    private function sendEmail($to, $subject, $body) {
        if (empty($this->username) || empty($this->password)) {
            error_log("Email configuration not set up");
            return false;
        }

        $headers = [
            'From: ' . $this->fromName . ' <' . $this->fromAddress . '>',
            'Reply-To: ' . $this->fromAddress,
            'Content-Type: text/html; charset=UTF-8',
            'MIME-Version: 1.0'
        ];

        // In production, use PHPMailer or similar library
        // For now, using basic mail() function
        return mail($to, $subject, $body, implode("\r\n", $headers));
    }

    private function buildVulnerabilityAlertTemplate($vulnerability) {
        return "
        <html>
        <body style='font-family: Arial, sans-serif;'>
            <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                <h2 style='color: #dc2626;'>Critical Vulnerability Alert</h2>
                <div style='background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 5px;'>
                    <h3>{$vulnerability['title']}</h3>
                    <p><strong>Severity:</strong> {$vulnerability['severity']}</p>
                    <p><strong>CVSS Score:</strong> {$vulnerability['cvss_score']}</p>
                    <p><strong>Description:</strong> {$vulnerability['description']}</p>
                    <p><strong>Asset:</strong> {$vulnerability['asset_name']}</p>
                </div>
                <p style='margin-top: 20px;'>Please review and address this vulnerability immediately.</p>
                <p>Best regards,<br>SecAudit Pro Team</p>
            </div>
        </body>
        </html>";
    }

    private function buildAuditReminderTemplate($audit) {
        return "
        <html>
        <body style='font-family: Arial, sans-serif;'>
            <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                <h2 style='color: #2563eb;'>Audit Reminder</h2>
                <div style='background: #eff6ff; border: 1px solid #bfdbfe; padding: 15px; border-radius: 5px;'>
                    <h3>{$audit['title']}</h3>
                    <p><strong>Type:</strong> {$audit['type']}</p>
                    <p><strong>Scheduled Date:</strong> {$audit['scheduled_date']}</p>
                    <p><strong>Status:</strong> {$audit['status']}</p>
                </div>
                <p style='margin-top: 20px;'>Please ensure you are prepared for the upcoming audit.</p>
                <p>Best regards,<br>SecAudit Pro Team</p>
            </div>
        </body>
        </html>";
    }

    private function buildReportGeneratedTemplate($report) {
        return "
        <html>
        <body style='font-family: Arial, sans-serif;'>
            <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                <h2 style='color: #059669;'>Report Generated Successfully</h2>
                <div style='background: #ecfdf5; border: 1px solid #a7f3d0; padding: 15px; border-radius: 5px;'>
                    <h3>{$report['title']}</h3>
                    <p><strong>Type:</strong> {$report['type']}</p>
                    <p><strong>Format:</strong> {$report['format']}</p>
                    <p><strong>Generated:</strong> {$report['generated_date']}</p>
                </div>
                <p style='margin-top: 20px;'>Your report is ready for download from the SecAudit Pro dashboard.</p>
                <p>Best regards,<br>SecAudit Pro Team</p>
            </div>
        </body>
        </html>";
    }
}