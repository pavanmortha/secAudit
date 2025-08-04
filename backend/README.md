# SecAudit Pro Backend API

A comprehensive PHP backend for the SecAudit Pro cybersecurity audit dashboard.

## Features

- **RESTful API**: Complete REST API for all dashboard functionality
- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Admin, Auditor, and Auditee roles
- **Database Integration**: MySQL database with proper relationships
- **Activity Logging**: Comprehensive audit trail
- **Report Generation**: Automated report creation
- **CORS Support**: Cross-origin resource sharing enabled

## Requirements

- PHP 7.4 or higher
- MySQL 5.7 or higher
- Apache/Nginx web server
- Composer (for dependencies)

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   composer install
   ```

3. **Configure database**:
   - Create a MySQL database named `secaudit_pro`
   - Update database credentials in `config/database.php`

4. **Run setup**:
   ```bash
   php setup.php
   ```

5. **Configure web server**:
   - Point document root to the backend directory
   - Ensure `.htaccess` is enabled (Apache) or configure URL rewriting (Nginx)

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration

### Dashboard
- `GET /dashboard/metrics` - Get dashboard metrics
- `GET /dashboard/activity` - Get recent activity
- `GET /dashboard/charts` - Get chart data

### Assets
- `GET /assets` - Get all assets
- `GET /assets/{id}` - Get asset by ID
- `POST /assets` - Create new asset
- `PUT /assets/{id}` - Update asset
- `DELETE /assets/{id}` - Delete asset
- `POST /assets/scan/{id}` - Start security scan

### Audits
- `GET /audits` - Get all audits
- `GET /audits/{id}` - Get audit by ID
- `POST /audits` - Create new audit
- `PUT /audits/{id}` - Update audit
- `DELETE /audits/{id}` - Delete audit
- `POST /audits/start/{id}` - Start audit
- `POST /audits/complete/{id}` - Complete audit

### Vulnerabilities
- `GET /vulnerabilities` - Get all vulnerabilities
- `GET /vulnerabilities/{id}` - Get vulnerability by ID
- `POST /vulnerabilities` - Create new vulnerability
- `PUT /vulnerabilities/{id}` - Update vulnerability
- `DELETE /vulnerabilities/{id}` - Delete vulnerability
- `POST /vulnerabilities/bulk-update` - Bulk update vulnerabilities

### Users
- `GET /users` - Get all users
- `GET /users/{id}` - Get user by ID
- `POST /users` - Create new user
- `PUT /users/{id}` - Update user
- `DELETE /users/{id}` - Delete user

### Reports
- `GET /reports` - Get all reports
- `GET /reports/{id}` - Get report by ID
- `POST /reports` - Create new report
- `POST /reports/generate` - Generate report
- `GET /reports/download/{id}` - Download report
- `DELETE /reports/{id}` - Delete report

## Authentication

All API endpoints (except `/auth/*`) require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Default Users

After running setup, the following users are available:

- **Admin**: admin@secaudit.com / admin123
- **Auditor**: auditor@secaudit.com / auditor123
- **Auditee**: auditee@secaudit.com / auditee123

## Database Schema

The backend uses the following main tables:

- `users` - User accounts and roles
- `assets` - Digital assets to be audited
- `audits` - Security audits and assessments
- `vulnerabilities` - Security vulnerabilities found
- `reports` - Generated reports
- `activity_logs` - System activity audit trail
- `audit_assets` - Many-to-many relationship between audits and assets

## Security Features

- Password hashing using PHP's `password_hash()`
- JWT token-based authentication
- SQL injection prevention using prepared statements
- CORS headers for cross-origin requests
- Activity logging for audit trails
- Role-based access control

## Error Handling

The API returns appropriate HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

Error responses include a JSON object with an `error` field describing the issue.

## Development

For development, you can use PHP's built-in server:

```bash
php -S localhost:8000
```

## Production Deployment

1. Configure a proper web server (Apache/Nginx)
2. Set up SSL/TLS certificates
3. Configure proper file permissions
4. Set up database backups
5. Configure log rotation
6. Update JWT secret key in production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.