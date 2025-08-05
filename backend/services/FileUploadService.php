<?php
class FileUploadService {
    private $uploadDir;
    private $maxFileSize;
    private $allowedTypes;

    public function __construct() {
        $this->uploadDir = __DIR__ . '/../uploads/';
        $this->maxFileSize = $_ENV['MAX_UPLOAD_SIZE'] ?? 10485760; // 10MB
        $this->allowedTypes = explode(',', $_ENV['ALLOWED_FILE_TYPES'] ?? 'pdf,doc,docx,txt,csv,xlsx');
        
        // Create upload directory if it doesn't exist
        if (!is_dir($this->uploadDir)) {
            mkdir($this->uploadDir, 0755, true);
        }
    }

    public function uploadFile($file, $category = 'general') {
        try {
            // Validate file
            $validation = $this->validateFile($file);
            if (!$validation['valid']) {
                return ['success' => false, 'error' => $validation['error']];
            }

            // Create category directory
            $categoryDir = $this->uploadDir . $category . '/';
            if (!is_dir($categoryDir)) {
                mkdir($categoryDir, 0755, true);
            }

            // Generate unique filename
            $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
            $filename = uniqid() . '_' . time() . '.' . $extension;
            $filepath = $categoryDir . $filename;

            // Move uploaded file
            if (move_uploaded_file($file['tmp_name'], $filepath)) {
                return [
                    'success' => true,
                    'filename' => $filename,
                    'filepath' => $category . '/' . $filename,
                    'size' => $file['size'],
                    'type' => $file['type']
                ];
            } else {
                return ['success' => false, 'error' => 'Failed to move uploaded file'];
            }
        } catch (Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    public function deleteFile($filepath) {
        try {
            $fullPath = $this->uploadDir . $filepath;
            if (file_exists($fullPath)) {
                return unlink($fullPath);
            }
            return false;
        } catch (Exception $e) {
            error_log("Failed to delete file: " . $e->getMessage());
            return false;
        }
    }

    public function getFileUrl($filepath) {
        return '/uploads/' . $filepath;
    }

    private function validateFile($file) {
        // Check for upload errors
        if ($file['error'] !== UPLOAD_ERR_OK) {
            return ['valid' => false, 'error' => 'File upload error: ' . $file['error']];
        }

        // Check file size
        if ($file['size'] > $this->maxFileSize) {
            return ['valid' => false, 'error' => 'File size exceeds maximum allowed size'];
        }

        // Check file type
        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($extension, $this->allowedTypes)) {
            return ['valid' => false, 'error' => 'File type not allowed'];
        }

        // Check MIME type
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        $allowedMimes = [
            'pdf' => 'application/pdf',
            'doc' => 'application/msword',
            'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'txt' => 'text/plain',
            'csv' => 'text/csv',
            'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];

        if (!in_array($mimeType, $allowedMimes)) {
            return ['valid' => false, 'error' => 'Invalid file type'];
        }

        return ['valid' => true];
    }

    public function uploadMultipleFiles($files, $category = 'general') {
        $results = [];
        
        foreach ($files['name'] as $key => $name) {
            $file = [
                'name' => $files['name'][$key],
                'type' => $files['type'][$key],
                'tmp_name' => $files['tmp_name'][$key],
                'error' => $files['error'][$key],
                'size' => $files['size'][$key]
            ];
            
            $results[] = $this->uploadFile($file, $category);
        }
        
        return $results;
    }
}