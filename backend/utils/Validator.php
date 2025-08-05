<?php
class Validator {
    private $errors = [];

    public function validate($data, $rules) {
        $this->errors = [];

        foreach ($rules as $field => $fieldRules) {
            $value = $data[$field] ?? null;
            $fieldRules = is_string($fieldRules) ? explode('|', $fieldRules) : $fieldRules;

            foreach ($fieldRules as $rule) {
                $this->applyRule($field, $value, $rule, $data);
            }
        }

        return empty($this->errors);
    }

    public function getErrors() {
        return $this->errors;
    }

    public function getFirstError() {
        return !empty($this->errors) ? reset($this->errors)[0] : null;
    }

    private function applyRule($field, $value, $rule, $data) {
        $ruleParts = explode(':', $rule);
        $ruleName = $ruleParts[0];
        $ruleValue = $ruleParts[1] ?? null;

        switch ($ruleName) {
            case 'required':
                if (empty($value) && $value !== '0') {
                    $this->addError($field, "$field is required");
                }
                break;

            case 'email':
                if (!empty($value) && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
                    $this->addError($field, "$field must be a valid email address");
                }
                break;

            case 'min':
                if (!empty($value) && strlen($value) < $ruleValue) {
                    $this->addError($field, "$field must be at least $ruleValue characters");
                }
                break;

            case 'max':
                if (!empty($value) && strlen($value) > $ruleValue) {
                    $this->addError($field, "$field must not exceed $ruleValue characters");
                }
                break;

            case 'numeric':
                if (!empty($value) && !is_numeric($value)) {
                    $this->addError($field, "$field must be numeric");
                }
                break;

            case 'integer':
                if (!empty($value) && !filter_var($value, FILTER_VALIDATE_INT)) {
                    $this->addError($field, "$field must be an integer");
                }
                break;

            case 'in':
                $allowedValues = explode(',', $ruleValue);
                if (!empty($value) && !in_array($value, $allowedValues)) {
                    $this->addError($field, "$field must be one of: " . implode(', ', $allowedValues));
                }
                break;

            case 'unique':
                // Format: unique:table,column
                $parts = explode(',', $ruleValue);
                $table = $parts[0];
                $column = $parts[1] ?? $field;
                
                if (!empty($value) && $this->checkUnique($table, $column, $value, $data['id'] ?? null)) {
                    $this->addError($field, "$field already exists");
                }
                break;

            case 'ip':
                if (!empty($value) && !filter_var($value, FILTER_VALIDATE_IP)) {
                    $this->addError($field, "$field must be a valid IP address");
                }
                break;

            case 'url':
                if (!empty($value) && !filter_var($value, FILTER_VALIDATE_URL)) {
                    $this->addError($field, "$field must be a valid URL");
                }
                break;

            case 'date':
                if (!empty($value) && !strtotime($value)) {
                    $this->addError($field, "$field must be a valid date");
                }
                break;

            case 'cvss':
                if (!empty($value) && (!is_numeric($value) || $value < 0 || $value > 10)) {
                    $this->addError($field, "$field must be a CVSS score between 0 and 10");
                }
                break;
        }
    }

    private function addError($field, $message) {
        if (!isset($this->errors[$field])) {
            $this->errors[$field] = [];
        }
        $this->errors[$field][] = $message;
    }

    private function checkUnique($table, $column, $value, $excludeId = null) {
        global $db; // Assuming global database connection
        
        $query = "SELECT COUNT(*) FROM $table WHERE $column = :value";
        $params = [':value' => $value];
        
        if ($excludeId) {
            $query .= " AND id != :id";
            $params[':id'] = $excludeId;
        }
        
        $stmt = $db->prepare($query);
        $stmt->execute($params);
        
        return $stmt->fetchColumn() > 0;
    }

    public static function sanitizeInput($input) {
        if (is_array($input)) {
            return array_map([self::class, 'sanitizeInput'], $input);
        }
        
        return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
    }

    public static function validateCSRF($token) {
        return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
    }

    public static function generateCSRFToken() {
        if (!isset($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['csrf_token'];
    }
}