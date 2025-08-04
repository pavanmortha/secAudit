<?php
require_once 'controllers/DashboardController.php';
require_once 'controllers/AssetController.php';
require_once 'controllers/AuditController.php';
require_once 'controllers/VulnerabilityController.php';
require_once 'controllers/UserController.php';
require_once 'controllers/ReportController.php';
require_once 'controllers/AuthController.php';

class Router {
    private $db;
    private $auth;

    public function __construct($db) {
        $this->db = $db;
        $this->auth = new AuthMiddleware($db);
    }

    public function handleRequest($method, $path) {
        // Remove leading slash and split path
        $path = ltrim($path, '/');
        $segments = explode('/', $path);

        // Handle authentication routes (no auth required)
        if ($segments[0] === 'auth') {
            $controller = new AuthController($this->db, $this->auth);
            return $this->handleAuthRoutes($controller, $method, $segments);
        }

        // All other routes require authentication
        $user = $this->auth->authenticate();

        // Route to appropriate controller
        switch ($segments[0]) {
            case 'dashboard':
                $controller = new DashboardController($this->db);
                return $this->handleDashboardRoutes($controller, $method, $segments, $user);
            
            case 'assets':
                $controller = new AssetController($this->db);
                return $this->handleAssetRoutes($controller, $method, $segments, $user);
            
            case 'audits':
                $controller = new AuditController($this->db);
                return $this->handleAuditRoutes($controller, $method, $segments, $user);
            
            case 'vulnerabilities':
                $controller = new VulnerabilityController($this->db);
                return $this->handleVulnerabilityRoutes($controller, $method, $segments, $user);
            
            case 'users':
                $controller = new UserController($this->db);
                return $this->handleUserRoutes($controller, $method, $segments, $user);
            
            case 'reports':
                $controller = new ReportController($this->db);
                return $this->handleReportRoutes($controller, $method, $segments, $user);
            
            default:
                http_response_code(404);
                echo json_encode(['error' => 'Route not found']);
        }
    }

    private function handleAuthRoutes($controller, $method, $segments) {
        if ($method === 'POST' && isset($segments[1])) {
            switch ($segments[1]) {
                case 'login':
                    return $controller->login();
                case 'register':
                    return $controller->register();
                default:
                    http_response_code(404);
                    echo json_encode(['error' => 'Auth route not found']);
            }
        }
    }

    private function handleDashboardRoutes($controller, $method, $segments, $user) {
        if ($method === 'GET') {
            if (isset($segments[1])) {
                switch ($segments[1]) {
                    case 'metrics':
                        return $controller->getMetrics();
                    case 'activity':
                        return $controller->getActivity();
                    case 'charts':
                        return $controller->getChartData();
                    default:
                        http_response_code(404);
                        echo json_encode(['error' => 'Dashboard route not found']);
                }
            }
        }
    }

    private function handleAssetRoutes($controller, $method, $segments, $user) {
        switch ($method) {
            case 'GET':
                if (isset($segments[1])) {
                    return $controller->getById($segments[1]);
                }
                return $controller->getAll();
            
            case 'POST':
                if (isset($segments[1]) && $segments[1] === 'scan' && isset($segments[2])) {
                    return $controller->startScan($segments[2]);
                }
                return $controller->create();
            
            case 'PUT':
                if (isset($segments[1])) {
                    return $controller->update($segments[1]);
                }
                break;
            
            case 'DELETE':
                if (isset($segments[1])) {
                    return $controller->delete($segments[1]);
                }
                break;
        }
        
        http_response_code(404);
        echo json_encode(['error' => 'Asset route not found']);
    }

    private function handleAuditRoutes($controller, $method, $segments, $user) {
        switch ($method) {
            case 'GET':
                if (isset($segments[1])) {
                    return $controller->getById($segments[1]);
                }
                return $controller->getAll();
            
            case 'POST':
                if (isset($segments[1])) {
                    switch ($segments[1]) {
                        case 'start':
                            return $controller->startAudit($segments[2] ?? null);
                        case 'complete':
                            return $controller->completeAudit($segments[2] ?? null);
                    }
                }
                return $controller->create();
            
            case 'PUT':
                if (isset($segments[1])) {
                    return $controller->update($segments[1]);
                }
                break;
            
            case 'DELETE':
                if (isset($segments[1])) {
                    return $controller->delete($segments[1]);
                }
                break;
        }
        
        http_response_code(404);
        echo json_encode(['error' => 'Audit route not found']);
    }

    private function handleVulnerabilityRoutes($controller, $method, $segments, $user) {
        switch ($method) {
            case 'GET':
                if (isset($segments[1])) {
                    return $controller->getById($segments[1]);
                }
                return $controller->getAll();
            
            case 'POST':
                if (isset($segments[1]) && $segments[1] === 'bulk-update') {
                    return $controller->bulkUpdate();
                }
                return $controller->create();
            
            case 'PUT':
                if (isset($segments[1])) {
                    return $controller->update($segments[1]);
                }
                break;
            
            case 'DELETE':
                if (isset($segments[1])) {
                    return $controller->delete($segments[1]);
                }
                break;
        }
        
        http_response_code(404);
        echo json_encode(['error' => 'Vulnerability route not found']);
    }

    private function handleUserRoutes($controller, $method, $segments, $user) {
        switch ($method) {
            case 'GET':
                if (isset($segments[1])) {
                    return $controller->getById($segments[1]);
                }
                return $controller->getAll();
            
            case 'POST':
                return $controller->create();
            
            case 'PUT':
                if (isset($segments[1])) {
                    return $controller->update($segments[1]);
                }
                break;
            
            case 'DELETE':
                if (isset($segments[1])) {
                    return $controller->delete($segments[1]);
                }
                break;
        }
        
        http_response_code(404);
        echo json_encode(['error' => 'User route not found']);
    }

    private function handleReportRoutes($controller, $method, $segments, $user) {
        switch ($method) {
            case 'GET':
                if (isset($segments[1])) {
                    if ($segments[1] === 'download' && isset($segments[2])) {
                        return $controller->download($segments[2]);
                    }
                    return $controller->getById($segments[1]);
                }
                return $controller->getAll();
            
            case 'POST':
                if (isset($segments[1]) && $segments[1] === 'generate') {
                    return $controller->generate();
                }
                return $controller->create();
            
            case 'DELETE':
                if (isset($segments[1])) {
                    return $controller->delete($segments[1]);
                }
                break;
        }
        
        http_response_code(404);
        echo json_encode(['error' => 'Report route not found']);
    }
}