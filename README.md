# SecAudit Pro - Cybersecurity Audit Dashboard

A comprehensive, real-time cybersecurity audit dashboard compliant with CERT-In guidelines. Built with React, TypeScript, and modern web technologies.

## Features

### 🔒 Security Management
- **Asset Management**: Track and monitor digital assets with real-time status updates
- **Vulnerability Assessment**: Comprehensive vulnerability tracking with CVSS scoring
- **Audit Scheduling**: Plan and execute security audits with automated workflows
- **Compliance Monitoring**: CERT-In compliant reporting and metrics

### 📊 Real-time Analytics
- **Live Dashboard**: Real-time metrics and KPI monitoring
- **Interactive Charts**: Vulnerability trends, compliance scores, and asset distribution
- **Heatmaps**: Visual representation of security posture across assets
- **Activity Feeds**: Live updates on security events and audit progress

### 🚀 Advanced Features
- **WebSocket Integration**: Real-time data synchronization
- **Automated Scanning**: Integrated security scanning with progress tracking
- **Smart Notifications**: Contextual alerts for critical security events
- **Report Generation**: Automated compliance and audit reports
- **Multi-user Support**: Role-based access control (Admin, Auditor, Auditee)

## Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Real-time**: Socket.IO, WebSocket
- **Charts**: Recharts, Chart.js
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PHP 7.4 or higher
- MySQL 5.7 or higher
- Composer

### Installation

1. Clone the repository:
```bash
cd secaudit-pro
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd backend
composer install
cp .env.example .env
# Edit .env with your database credentials
```

4. Set up database:
```bash
# Create MySQL database
mysql -u root -p -e "CREATE DATABASE secaudit_pro;"

# Run installation script
php install.php
```

5. Start the development servers:
```bash
# Start all services (frontend + backend + websocket)
npm run dev:full

# Or start individually:
# Backend API server
cd backend && php -S localhost:8000

# Frontend development server
npm run dev

# WebSocket server (for real-time features)
npm run mock-server
```

This will start:
- Frontend development server on `http://localhost:5173`
- Backend API server on `http://localhost:8000`
- Mock WebSocket server on `http://localhost:3001`

### Development Scripts

- `npm run dev` - Start frontend only
- `npm run dev:full` - Start frontend + backend + websocket server
- `npm run backend` - Start backend server only
- `npm run mock-server` - Start mock server only
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Default Login Credentials

After running the installation script, you can log in with:

- **Admin**: admin@secaudit.com / admin123
- **Auditor**: auditor@secaudit.com / auditor123
- **Auditee**: auditee@secaudit.com / auditee123

## Architecture

### Real-time Data Flow
```
PHP Backend API ←→ React Query ←→ Components
       ↓                ↓              ↓
   Database        Cache Management  UI Updates
       ↑
WebSocket Server (Real-time updates)
```

### Key Components

- **Dashboard**: Real-time metrics and overview
- **Assets**: Asset management with live scanning
- **Vulnerabilities**: Vulnerability tracking with heatmaps
- **Audits**: Audit scheduling and progress tracking
- **Reports**: Automated report generation
- **Users**: User management and role assignment

### Real-time Features

1. **Live Metrics**: Dashboard metrics update automatically
2. **Scan Progress**: Real-time security scan progress tracking
3. **Notifications**: Instant alerts for critical events
4. **Activity Feed**: Live stream of security events
5. **Collaborative Updates**: Multi-user real-time synchronization

## API Integration

The application uses a PHP REST API backend with the following endpoints:

- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `GET /api/dashboard/metrics` - Dashboard metrics
- `GET /api/dashboard/activity` - Recent activity
- `GET /api/dashboard/charts` - Chart data
- `GET /api/assets` - Asset management
- `POST /api/assets` - Create asset
- `PUT /api/assets/{id}` - Update asset
- `DELETE /api/assets/{id}` - Delete asset
- `GET /api/vulnerabilities` - Vulnerability data
- `POST /api/vulnerabilities` - Create vulnerability
- `PUT /api/vulnerabilities/{id}` - Update vulnerability
- `GET /api/audits` - Audit information
- `POST /api/audits` - Create audit
- `PUT /api/audits/{id}` - Update audit
- `GET /api/users` - User management (Admin only)
- `POST /api/users` - Create user (Admin only)
- `POST /api/reports/generate` - Report generation
- `GET /api/reports` - List reports
- `GET /api/reports/{id}/download` - Download report

## Deployment

### Production Build
```bash
npm run build
```

### Environment Configuration
Set the following environment variables for production:

Frontend (.env):
- `VITE_API_URL` - Backend API URL (default: http://localhost:8000/api)
- `VITE_WS_URL` - WebSocket server URL
- `VITE_ENABLE_REAL_TIME` - Enable real-time features

Backend (.env):
- `DB_HOST` - Database host
- `DB_NAME` - Database name
- `DB_USER` - Database username
- `DB_PASS` - Database password
- `JWT_SECRET` - JWT signing secret
- `CORS_ORIGIN` - Allowed CORS origin

### Production Deployment

1. **Frontend**: Build and deploy to a web server
```bash
npm run build
# Deploy dist/ folder to your web server
```

2. **Backend**: Deploy PHP files to a web server with PHP support
```bash
# Copy backend files to web server
# Ensure .env is configured for production
# Set up proper web server configuration (Apache/Nginx)
```

3. **Database**: Set up MySQL database and run installation script

## Security Considerations

- JWT-based authentication
- Role-based access control
- Secure WebSocket connections
- Input validation and sanitization
- HTTPS enforcement in production
- Environment-based configuration
- SQL injection prevention
- CORS configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.
