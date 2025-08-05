<?php
class Logger {
    private $logFile;
    private $logLevel;

    const EMERGENCY = 0;
    const ALERT = 1;
    const CRITICAL = 2;
    const ERROR = 3;
    const WARNING = 4;
    const NOTICE = 5;
    const INFO = 6;
    const DEBUG = 7;

    public function __construct($logFile = null, $logLevel = self::INFO) {
        $this->logFile = $logFile ?: __DIR__ . '/../logs/app.log';
        $this->logLevel = $logLevel;
        
        // Create logs directory if it doesn't exist
        $logDir = dirname($this->logFile);
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }
    }

    public function emergency($message, $context = []) {
        $this->log(self::EMERGENCY, $message, $context);
    }

    public function alert($message, $context = []) {
        $this->log(self::ALERT, $message, $context);
    }

    public function critical($message, $context = []) {
        $this->log(self::CRITICAL, $message, $context);
    }

    public function error($message, $context = []) {
        $this->log(self::ERROR, $message, $context);
    }

    public function warning($message, $context = []) {
        $this->log(self::WARNING, $message, $context);
    }

    public function notice($message, $context = []) {
        $this->log(self::NOTICE, $message, $context);
    }

    public function info($message, $context = []) {
        $this->log(self::INFO, $message, $context);
    }

    public function debug($message, $context = []) {
        $this->log(self::DEBUG, $message, $context);
    }

    private function log($level, $message, $context = []) {
        if ($level > $this->logLevel) {
            return;
        }

        $levelNames = [
            self::EMERGENCY => 'EMERGENCY',
            self::ALERT => 'ALERT',
            self::CRITICAL => 'CRITICAL',
            self::ERROR => 'ERROR',
            self::WARNING => 'WARNING',
            self::NOTICE => 'NOTICE',
            self::INFO => 'INFO',
            self::DEBUG => 'DEBUG'
        ];

        $timestamp = date('Y-m-d H:i:s');
        $levelName = $levelNames[$level];
        $contextString = !empty($context) ? ' ' . json_encode($context) : '';
        
        $logEntry = "[$timestamp] $levelName: $message$contextString" . PHP_EOL;
        
        file_put_contents($this->logFile, $logEntry, FILE_APPEND | LOCK_EX);
    }

    public function logSecurityEvent($event, $userId = null, $details = []) {
        $context = [
            'user_id' => $userId,
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
            'details' => $details
        ];

        $this->warning("Security Event: $event", $context);
    }

    public function logApiRequest($method, $endpoint, $userId = null, $responseCode = null) {
        $context = [
            'method' => $method,
            'endpoint' => $endpoint,
            'user_id' => $userId,
            'response_code' => $responseCode,
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
        ];

        $this->info("API Request", $context);
    }
}