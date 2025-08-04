export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'auditor' | 'auditee';
  department?: string;
  phone?: string;
  lastLogin?: Date;
}

export interface Asset {
  id: string;
  name: string;
  type: 'web_app' | 'server' | 'database' | 'endpoint' | 'network_device';
  ip: string;
  os: string;
  version?: string;
  criticality: 'critical' | 'high' | 'medium' | 'low';
  owner: string;
  department: string;
  location?: string;
  lastUpdated: Date;
  status: 'active' | 'inactive' | 'maintenance';
}

export interface Audit {
  id: string;
  title: string;
  type: 'vapt' | 'config_audit' | 'red_team' | 'code_review';
  scope: string[];
  assetIds: string[];
  auditorId: string;
  auditeeId: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  scheduledDate: Date;
  completedDate?: Date;
  frequency: 'quarterly' | 'annually' | 'one_time';
  documents?: string[];
  findings?: Vulnerability[];
}

export interface Vulnerability {
  id: string;
  auditId: string;
  assetId: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  cvssScore: number;
  epssScore?: number;
  cveId?: string;
  category: string;
  status: 'open' | 'in_progress' | 'resolved' | 'false_positive';
  assignedTo?: string;
  dueDate?: Date;
  rootCause?: string;
  remediation?: string;
  evidence?: string[];
  discoveredDate: Date;
  resolvedDate?: Date;
}

export interface ComplianceMetrics {
  totalAssets: number;
  totalAudits: number;
  pendingVulnerabilities: number;
  criticalVulnerabilities: number;
  highVulnerabilities: number;
  overdueTasks: number;
  complianceScore: number;
  auditCoverage: number;
}