<?php
class AuthController {
    private $db;
    private $auth;

    public function __construct($db, $auth) {
        $this->db = $db;
        $this->auth = $auth;
    }

    public function login() {
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (!isset($data['email']) || !isset($data['password'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Email and password required']);
            return;
        }

        $result = $this->auth->login($data['email'], $data['password']);
        
        if ($result['success']) {
            http_response_code(200);
            echo json_encode($result);
        } else {
            http_response_code(401);
            echo json_encode(['error' => $result['message']]);
        }
    }

    public function register() {
        $data = json_decode(file_get_contents("php://input"), true);
        
        $required_fields = ['name', 'email', 'password', 'role'];
        foreach ($required_fields as $field) {
            if (!isset($data[$field])) {
                http_response_code(400);
                echo json_encode(['error' => ucfirst($field) . ' is required']);
                return;
            }
        }

        // Check if user already exists
        $check_query = "SELECT id FROM users WHERE email = :email";
        $check_stmt = $this->db->prepare($check_query);
        $check_stmt->bindParam(':email', $data['email']);
        $check_stmt->execute();

        if ($check_stmt->rowCount() > 0) {
            http_response_code(409);
            echo json_encode(['error' => 'User already exists']);
            return;
        }

        // Create new user
        $query = "INSERT INTO users (name, email, password, role, department, phone) 
                  VALUES (:name, :email, :password, :role, :department, :phone)";
        
        $stmt = $this->db->prepare($query);
        $hashed_password = password_hash($data['password'], PASSWORD_DEFAULT);
        
        $stmt->bindParam(':name', $data['name']);
        $stmt->bindParam(':email', $data['email']);
        $stmt->bindParam(':password', $hashed_password);
        $stmt->bindParam(':role', $data['role']);
        $stmt->bindParam(':department', $data['department'] ?? null);
        $stmt->bindParam(':phone', $data['phone'] ?? null);

        if ($stmt->execute()) {
            $user_id = $this->db->lastInsertId();
            $token = $this->auth->generateToken($user_id, $data['email'], $data['role']);
            
            http_response_code(201);
            echo json_encode([
                'success' => true,
                'token' => $token,
                'user' => [
                    'id' => $user_id,
                    'name' => $data['name'],
                    'email' => $data['email'],
                    'role' => $data['role'],
                    'department' => $data['department'] ?? null
                ]
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create user']);
        }
    }
}