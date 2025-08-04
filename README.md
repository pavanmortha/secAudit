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

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd secaudit-pro
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Start the development server with mock backend:
```bash
npm run dev:full
```

This will start:
- Frontend development server on `http://localhost:5173`
- Mock WebSocket server on `http://localhost:3001`

### Development Scripts

- `npm run dev` - Start frontend only
- `npm run dev:full` - Start frontend + mock server
- `npm run mock-server` - Start mock server only
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Architecture

### Real-time Data Flow
```
WebSocket Server ←→ React Query ←→ Components
       ↓                ↓              ↓
   Live Updates    Cache Management  UI Updates
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

The application is designed to work with a REST API backend. Mock endpoints are provided for development:

- `GET /api/dashboard/metrics` - Dashboard metrics
- `GET /api/assets` - Asset management
- `GET /api/vulnerabilities` - Vulnerability data
- `GET /api/audits` - Audit information
- `POST /api/reports/generate` - Report generation

## Deployment

### Production Build
```bash
npm run build
```

### Environment Configuration
Set the following environment variables for production:

- `VITE_API_URL` - Backend API URL
- `VITE_WS_URL` - WebSocket server URL
- `VITE_ENABLE_REAL_TIME` - Enable real-time features

## Security Considerations

- JWT-based authentication
- Role-based access control
- Secure WebSocket connections
- Input validation and sanitization
- HTTPS enforcement in production

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
