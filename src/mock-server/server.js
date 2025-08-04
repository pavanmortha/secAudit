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

app.use(cors());
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

// REST API endpoints
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
});