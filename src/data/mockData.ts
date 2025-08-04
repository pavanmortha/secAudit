import { Asset, Audit, Vulnerability, ComplianceMetrics } from '../types';

export const mockAssets: Asset[] = [
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
    lastUpdated: new Date('2024-01-15'),
    status: 'active'
  },
  {
    id: '2',
    name: 'Customer Portal',
    type: 'web_app',
    ip: '192.168.1.20',
    os: 'CentOS 8',
    criticality: 'high',
    owner: 'Jane Doe',
    department: 'Development',
    location: 'Cloud AWS',
    lastUpdated: new Date('2024-01-10'),
    status: 'active'
  },
  {
    id: '3',
    name: 'Database Server',
    type: 'database',
    ip: '192.168.1.30',
    os: 'RHEL 8.5',
    criticality: 'critical',
    owner: 'Mike Johnson',
    department: 'Database',
    location: 'Data Center B',
    lastUpdated: new Date('2024-01-12'),
    status: 'active'
  }
];

export const mockAudits: Audit[] = [
  {
    id: '1',
    title: 'Q1 2024 VAPT Assessment',
    type: 'vapt',
    scope: ['Web Application', 'Network Infrastructure'],
    assetIds: ['1', '2'],
    auditorId: 'aud1',
    auditeeId: 'aue1',
    status: 'in_progress',
    scheduledDate: new Date('2024-01-20'),
    frequency: 'quarterly',
    documents: ['scope.pdf', 'checklist.pdf']
  },
  {
    id: '2',
    title: 'Annual Security Configuration Review',
    type: 'config_audit',
    scope: ['All Servers', 'Network Devices'],
    assetIds: ['1', '3'],
    auditorId: 'aud2',
    auditeeId: 'aue2',
    status: 'scheduled',
    scheduledDate: new Date('2024-02-01'),
    frequency: 'annually'
  }
];

export const mockVulnerabilities: Vulnerability[] = [
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
    dueDate: new Date('2024-02-15'),
    discoveredDate: new Date('2024-01-10')
  },
  {
    id: '2',
    auditId: '1',
    assetId: '2',
    title: 'Outdated SSL/TLS Configuration',
    description: 'Server supports deprecated TLS 1.0 and 1.1 protocols.',
    severity: 'medium',
    cvssScore: 5.3,
    category: 'Configuration',
    status: 'in_progress',
    assignedTo: 'sysadmin1',
    dueDate: new Date('2024-02-20'),
    discoveredDate: new Date('2024-01-12')
  }
];

export const mockComplianceMetrics: ComplianceMetrics = {
  totalAssets: 45,
  totalAudits: 12,
  pendingVulnerabilities: 23,
  criticalVulnerabilities: 3,
  highVulnerabilities: 8,
  overdueTasks: 2,
  complianceScore: 78,
  auditCoverage: 85
};