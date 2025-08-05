<?php
class UserController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function getAll() {
        try {
            $query = "SELECT id, name, email, role, department, phone, last_login, created_at FROM users ORDER BY created_at DESC";
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Format data for frontend
            $users = array_map(function($user) {
                return [
                    'id' => $user['id'],
                    'name' => $user['name'],
                    'email' => $user['email'],
                    'role' => $user['role'],
                    'department' => $user['department'],
                    'phone' => $user['phone'],
                    'lastLogin' => $user['last_login']
                ];
            }, $users);

            http_response_code(200);
            echo json_encode($users);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch users: ' . $e->getMessage()]);
        }
    }

    public function getById($id) {
        try {
            $query = "SELECT id, name, email, role, department, phone, last_login, created_at FROM users WHERE id = :id";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                $user = $stmt->fetch(PDO::FETCH_ASSOC);
                
                $formatted_user = [
                    'id' => $user['id'],
                    'name' => $user['name'],
                    'email' => $user['email'],
                    'role' => $user['role'],
                    'department' => $user['department'],
                    'phone' => $user['phone'],
                    'lastLogin' => $user['last_login']
                ];
                
                http_response_code(200);
                echo json_encode($formatted_user);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'User not found']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch user: ' . $e->getMessage()]);
        }
    }

    public function create() {
        try {
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
                echo json_encode(['error' => 'User with this email already exists']);
                return;
            }

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
                
                // Log activity
                $this->logActivity('create', 'user', $user_id, 'Created new user: ' . $data['name']);
                
                $this->getById($user_id);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to create user']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create user: ' . $e->getMessage()]);
        }
    }

    public function update($id) {
        try {
            $data = json_decode(file_get_contents("php://input"), true);
            
            // Build dynamic update query
            $fields = [];
            $params = [':id' => $id];
            
            $allowed_fields = ['name', 'email', 'role', 'department', 'phone'];
            
            foreach ($allowed_fields as $field) {
                if (isset($data[$field])) {
                    $fields[] = "$field = :$field";
                    $params[":$field"] = $data[$field];
                }
            }

            // Handle password separately
            if (isset($data['password']) && !empty($data['password'])) {
                $fields[] = "password = :password";
                $params[":password"] = password_hash($data['password'], PASSWORD_DEFAULT);
            }
            
            if (empty($fields)) {
                http_response_code(400);
                echo json_encode(['error' => 'No valid fields to update']);
                return;
            }

            // Check if email is being updated and if it already exists
            if (isset($data['email'])) {
                $check_query = "SELECT id FROM users WHERE email = :email AND id != :id";
                $check_stmt = $this->db->prepare($check_query);
                $check_stmt->bindParam(':email', $data['email']);
                $check_stmt->bindParam(':id', $id);
                $check_stmt->execute();

                if ($check_stmt->rowCount() > 0) {
                    http_response_code(409);
                    echo json_encode(['error' => 'Email already exists']);
                    return;
                }
            }
            
            $query = "UPDATE users SET " . implode(', ', $fields) . " WHERE id = :id";
            $stmt = $this->db->prepare($query);
            
            if ($stmt->execute($params)) {
                // Log activity
                $this->logActivity('update', 'user', $id, 'Updated user');
                
                $this->getById($id);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to update user']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update user: ' . $e->getMessage()]);
        }
    }

    public function delete($id) {
        try {
            // Check if user exists
            $check_query = "SELECT name FROM users WHERE id = :id";
            $check_stmt = $this->db->prepare($check_query);
            $check_stmt->bindParam(':id', $id);
            $check_stmt->execute();
            
            if ($check_stmt->rowCount() === 0) {
                http_response_code(404);
                echo json_encode(['error' => 'User not found']);
                return;
            }
            
            $user_name = $check_stmt->fetch(PDO::FETCH_ASSOC)['name'];
            
            // Check if user is referenced in other tables
            $ref_checks = [
                'audits' => ['auditor_id', 'auditee_id'],
                'vulnerabilities' => ['assigned_to'],
                'reports' => ['generated_by']
            ];
            
            foreach ($ref_checks as $table => $columns) {
                foreach ($columns as $column) {
                    $ref_query = "SELECT COUNT(*) as count FROM $table WHERE $column = :id";
                    $ref_stmt = $this->db->prepare($ref_query);
                    $ref_stmt->bindParam(':id', $id);
                    $ref_stmt->execute();
                    $count = $ref_stmt->fetch(PDO::FETCH_ASSOC)['count'];
                    
                    if ($count > 0) {
                        http_response_code(409);
                        echo json_encode(['error' => 'Cannot delete user: referenced in ' . $table]);
                        return;
                    }
                }
            }
            
            $query = "DELETE FROM users WHERE id = :id";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id', $id);
            
            if ($stmt->execute()) {
                // Log activity
                $this->logActivity('delete', 'user', $id, 'Deleted user: ' . $user_name);
                
                http_response_code(200);
                echo json_encode(['success' => true, 'message' => 'User deleted successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to delete user']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete user: ' . $e->getMessage()]);
        }
    }

    private function logActivity($action, $entity_type, $entity_id, $details) {
        try {
            $query = "INSERT INTO activity_logs (action, entity_type, entity_id, details, ip_address, user_agent) 
                      VALUES (:action, :entity_type, :entity_id, :details, :ip_address, :user_agent)";
            
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':action', $action);
            $stmt->bindParam(':entity_type', $entity_type);
            $stmt->bindParam(':entity_id', $entity_id);
            $stmt->bindParam(':details', $details);
            $stmt->bindParam(':ip_address', $_SERVER['REMOTE_ADDR'] ?? null);
            $stmt->bindParam(':user_agent', $_SERVER['HTTP_USER_AGENT'] ?? null);
            $stmt->execute();
        } catch (Exception $e) {
            error_log("Failed to log activity: " . $e->getMessage());
        }
    }
}