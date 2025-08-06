// Mock WebSocket server for development
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

// Mock data
let mockMetrics = {
  totalAssets: 45,
  totalAudits: 12,
  pendingVulnerabilities: 23,
  criticalVulnerabilities: 3,
  highVulnerabilities: 8,
  overdueTasks: 2,
  complianceScore: 78,
  auditCoverage: 85
};

let mockActivities = [
  {
    id: '1',
    type: 'vulnerability_found',
    title: 'Critical SQL Injection Found',
    description: 'New critical vulnerability discovered in login form',
    timestamp: new Date(),
    user: 'Security Scanner',
    severity: 'critical'
  }
];

// WebSocket connections
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join', (room) => {
    socket.join(room);
    console.log(`Client ${socket.id} joined room: ${room}`);
  });

  socket.on('leave', (room) => {
    socket.leave(room);
    console.log(`Client ${socket.id} left room: ${room}`);
  });

  socket.on('scan:start', ({ assetId }) => {
    console.log(`Starting scan for asset: ${assetId}`);
    simulateScan(socket, assetId);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Simulate real-time updates
setInterval(() => {
  // Simulate metrics updates
  mockMetrics.pendingVulnerabilities += Math.floor(Math.random() * 3) - 1;
  mockMetrics.complianceScore += Math.floor(Math.random() * 5) - 2;
  
  io.emit('metrics:updated', mockMetrics);
}, 30000); // Every 30 seconds

setInterval(() => {
  // Simulate new activity
  const activities = [
    'New vulnerability discovered',
    'Audit completed',
    'Asset updated',
    'Security scan finished'
  ];
  
  const newActivity = {
    id: Date.now().toString(),
    type: 'info',
    title: activities[Math.floor(Math.random() * activities.length)],
    description: 'Automated system update',
    timestamp: new Date(),
    user: 'System',
    severity: 'info'
  };
  
  mockActivities.unshift(newActivity);
  io.emit('activity:new', newActivity);
}, 45000); // Every 45 seconds

function simulateScan(socket, assetId) {
  let progress = 0;
  const stages = [
    'Initializing scan...',
    'Port scanning...',
    'Service detection...',
    'Vulnerability assessment...',
    'Generating report...',
    'Scan completed'
  ];
  
  const interval = setInterval(() => {
    progress += Math.floor(Math.random() * 15) + 5;
    if (progress > 100) progress = 100;
    
    const stageIndex = Math.floor((progress / 100) * (stages.length - 1));
    
    socket.emit('scan:progress', {
      assetId,
      isScanning: progress < 100,
      progress,
      stage: stages[stageIndex],
      findings: Math.floor(progress / 10)
    });
    
    if (progress >= 100) {
      clearInterval(interval);
    }
  }, 2000);
}

// REST API endpoints for mock data
app.get('/api/dashboard/metrics', (req, res) => {
  res.json(mockMetrics);
});

app.get('/api/dashboard/activity', (req, res) => {
  res.json(mockActivities.slice(0, 10));
});

app.get('/api/dashboard/charts', (req, res) => {
  res.json({
    vulnerabilityTrend: generateTrendData(),
    complianceScore: generateComplianceData(),
    assetDistribution: generateAssetDistribution(),
    auditProgress: generateAuditProgress()
  });
});

app.get('/api/assets', (req, res) => {
  const assets = [
    {
      id: '1',
      name: 'Web Application Server',
      type: 'server',
      ip: '192.168.1.10',
      os: 'Ubuntu 20.04',
      version: '20.04.3',
      criticality: 'critical',
      owner: 'John Smith',
      department: 'IT',
      location: 'Data Center A',
      status: 'active',
      lastUpdated: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Customer Portal',
      type: 'web_app',
      ip: '192.168.1.20',
      os: 'CentOS 8',
      version: '8.5',
      criticality: 'high',
      owner: 'Jane Doe',
      department: 'Development',
      location: 'Cloud AWS',
      status: 'active',
      lastUpdated: new Date().toISOString()
    }
  ];
  res.json(assets);
});

app.get('/api/audits', (req, res) => {
  const audits = [
    {
      id: '1',
      title: 'Q1 2024 VAPT Assessment',
      type: 'vapt',
      scope: ['Web Application', 'Network Infrastructure'],
      assetIds: ['1', '2'],
      auditorId: 'aud1',
      auditeeId: 'aue1',
      status: 'in_progress',
      scheduledDate: '2024-01-20',
      frequency: 'quarterly',
      documents: ['scope.pdf', 'checklist.pdf']
    }
  ];
  res.json(audits);
});

app.get('/api/vulnerabilities', (req, res) => {
  const vulnerabilities = [
    {
      id: '1',
      auditId: '1',
      assetId: '1',
      title: 'SQL Injection in Login Form',
      description: 'The login form is vulnerable to SQL injection attacks through the username parameter.',
      severity: 'critical',
      cvssScore: 9.1,
      epssScore: 0.85,
      cveId: 'CVE-2024-0001',
      category: 'Injection',
      status: 'open',
      assignedTo: 'dev1',
      dueDate: '2024-02-15',
      discoveredDate: '2024-01-10'
    }
  ];
  res.json(vulnerabilities);
});

app.get('/api/users', (req, res) => {
  const users = [
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@secaudit.com',
      role: 'admin',
      department: 'IT Security',
      lastLogin: new Date().toISOString()
    }
  ];
  res.json(users);
});

app.get('/api/reports', (req, res) => {
  const reports = [
    {
      id: '1',
      title: 'Weekly Security Report',
      type: 'audit_summary',
      generatedBy: 'Admin User',
      status: 'final',
      fileSize: '2.3 MB',
      format: 'pdf',
      generatedDate: new Date().toISOString()
    }
  ];
  res.json(reports);
});

// POST endpoints for creating data
app.post('/api/assets', (req, res) => {
  const newAsset = { ...req.body, id: Date.now().toString(), lastUpdated: new Date().toISOString() };
  res.status(201).json(newAsset);
});

app.post('/api/audits', (req, res) => {
  const newAudit = { ...req.body, id: Date.now().toString() };
  res.status(201).json(newAudit);
});

app.post('/api/vulnerabilities', (req, res) => {
  const newVuln = { ...req.body, id: Date.now().toString(), discoveredDate: new Date().toISOString() };
  res.status(201).json(newVuln);
});

app.post('/api/users', (req, res) => {
  const newUser = { ...req.body, id: Date.now().toString() };
  res.status(201).json(newUser);
});

app.post('/api/reports/generate', (req, res) => {
  const newReport = {
    id: Date.now().toString(),
    title: `${req.body.type} Report`,
    type: req.body.type,
    generatedBy: 'System',
    status: 'final',
    fileSize: '1.5 MB',
    format: req.body.params?.format || 'pdf',
    generatedDate: new Date().toISOString()
  };
  res.status(201).json(newReport);
});

// PUT endpoints for updating data
app.put('/api/assets/:id', (req, res) => {
  const updatedAsset = { ...req.body, id: req.params.id, lastUpdated: new Date().toISOString() };
  res.json(updatedAsset);
});

app.put('/api/audits/:id', (req, res) => {
  const updatedAudit = { ...req.body, id: req.params.id };
  res.json(updatedAudit);
});

app.put('/api/vulnerabilities/:id', (req, res) => {
  const updatedVuln = { ...req.body, id: req.params.id };
  res.json(updatedVuln);
});

app.put('/api/users/:id', (req, res) => {
  const updatedUser = { ...req.body, id: req.params.id };
  res.json(updatedUser);
});

// DELETE endpoints
app.delete('/api/assets/:id', (req, res) => {
  res.json({ success: true, message: 'Asset deleted successfully' });
});

app.delete('/api/audits/:id', (req, res) => {
  res.json({ success: true, message: 'Audit deleted successfully' });
});

app.delete('/api/vulnerabilities/:id', (req, res) => {
  res.json({ success: true, message: 'Vulnerability deleted successfully' });
});

app.delete('/api/users/:id', (req, res) => {
  res.json({ success: true, message: 'User deleted successfully' });
});

// Authentication endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Mock authentication
  const users = {
    'admin@secaudit.com': { id: '1', name: 'Admin User', role: 'admin', department: 'IT Security' },
    'auditor@secaudit.com': { id: '2', name: 'John Auditor', role: 'auditor', department: 'Security' },
    'auditee@secaudit.com': { id: '3', name: 'Jane Developer', role: 'auditee', department: 'Development' }
  };
  
  if (users[email] && (password === 'admin123' || password === 'auditor123' || password === 'auditee123')) {
    res.json({
      success: true,
      token: 'mock-jwt-token',
      user: users[email]
    });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// CERT-In Audit endpoints
app.get('/api/certin/checks', (req, res) => {
  const checks = [
    {
      id: 'network-security',
      category: 'Network Security',
      name: 'Network Infrastructure Assessment',
      status: 'completed',
      progress: 100,
      findings: 3,
      compliance: false,
      lastRun: new Date().toISOString()
    },
    {
      id: 'access-control',
      category: 'Access Control',
      name: 'Identity & Access Management',
      status: 'running',
      progress: 65,
      findings: 1,
      compliance: true
    }
  ];
  res.json(checks);
});

app.post('/api/certin/scan/:id', (req, res) => {
  const scanId = req.params.id;
  res.json({
    success: true,
    message: `Started CERT-In scan: ${scanId}`,
    scanId: Date.now().toString()
  });
});

app.get('/api/certin/compliance', (req, res) => {
  const compliance = {
    overallScore: 78,
    requirements: [
      { category: 'Incident Response', score: 85, status: 'compliant' },
      { category: 'Security Monitoring', score: 90, status: 'compliant' },
      { category: 'Vulnerability Management', score: 75, status: 'partial' },
      { category: 'Access Control', score: 60, status: 'non-compliant' },
      { category: 'Data Protection', score: 80, status: 'compliant' }
    ]
  };
  res.json(compliance);
});

function generateTrendData() {
  const data = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      critical: Math.floor(Math.random() * 5),
      high: Math.floor(Math.random() * 10),
      medium: Math.floor(Math.random() * 15),
      low: Math.floor(Math.random() * 20)
    });
  }
  return data;
}

function generateComplianceData() {
  const data = [];
  for (let i = 11; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      score: Math.floor(Math.random() * 20) + 70
    });
  }
  return data;
}

function generateAssetDistribution() {
  return [
    { name: 'Web Apps', value: 15 },
    { name: 'Servers', value: 12 },
    { name: 'Databases', value: 8 },
    { name: 'Endpoints', value: 25 },
    { name: 'Network Devices', value: 10 }
  ];
}

function generateAuditProgress() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return months.map(month => ({
    month,
    completed: Math.floor(Math.random() * 5) + 2,
    inProgress: Math.floor(Math.random() * 3) + 1,
    scheduled: Math.floor(Math.random() * 4) + 1
  }));
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Mock server running on port ${PORT}`);
  console.log(`Frontend should connect to: http://localhost:${PORT}`);
  console.log(`WebSocket available at: ws://localhost:${PORT}`);
});