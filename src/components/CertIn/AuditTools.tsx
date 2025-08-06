import React, { useState } from 'react';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Play, 
  FileText,
  Download,
  Settings,
  Target,
  Lock,
  Globe,
  Server,
  Database,
  Network,
  Eye,
  Users,
  Zap,
  Activity
} from 'lucide-react';
import { motion } from 'framer-motion';
import { CertInCompliance } from './CertInCompliance';
import { SecurityAssessment } from './SecurityAssessment';
import { VulnerabilityScanner } from './VulnerabilityScanner';
import { ComplianceReporter } from './ComplianceReporter';
import { ThreatIntelligence } from './ThreatIntelligence';

interface AuditCheck {
  id: string;
  category: string;
  name: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  findings: number;
  lastRun?: Date;
  duration?: string;
  compliance: boolean;
  automated: boolean;
  certInRef: string;
}

const certInChecks: AuditCheck[] = [
  {
    id: 'network-security',
    category: 'Network Security',
    name: 'Network Infrastructure Assessment',
    description: 'Comprehensive network security evaluation including firewall, IDS/IPS, and network segmentation',
    severity: 'critical',
    status: 'completed',
    progress: 100,
    findings: 3,
    lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000),
    duration: '45 minutes',
    compliance: false,
    automated: true,
    certInRef: 'CERT-In-NS-001'
  },
  {
    id: 'access-control',
    category: 'Access Control',
    name: 'Identity & Access Management',
    description: 'User authentication, authorization, and privilege management assessment',
    severity: 'critical',
    status: 'running',
    progress: 65,
    findings: 1,
    compliance: true,
    automated: true,
    certInRef: 'CERT-In-AC-002'
  },
  {
    id: 'data-protection',
    category: 'Data Protection',
    name: 'Data Classification & Encryption',
    description: 'Data handling, classification, encryption at rest and in transit verification',
    severity: 'high',
    status: 'pending',
    progress: 0,
    findings: 0,
    compliance: true,
    automated: false,
    certInRef: 'CERT-In-DP-003'
  },
  {
    id: 'incident-response',
    category: 'Incident Response',
    name: 'Incident Response Preparedness',
    description: 'Incident response plan, procedures, and team readiness assessment',
    severity: 'high',
    status: 'completed',
    progress: 100,
    findings: 2,
    lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000),
    duration: '30 minutes',
    compliance: true,
    automated: false,
    certInRef: 'CERT-In-IR-004'
  },
  {
    id: 'vulnerability-mgmt',
    category: 'Vulnerability Management',
    name: 'Vulnerability Assessment & Management',
    description: 'Systematic vulnerability identification, assessment, and remediation tracking',
    severity: 'critical',
    status: 'completed',
    progress: 100,
    findings: 8,
    lastRun: new Date(Date.now() - 6 * 60 * 60 * 1000),
    duration: '2 hours',
    compliance: false,
    automated: true,
    certInRef: 'CERT-In-VM-005'
  },
  {
    id: 'security-monitoring',
    category: 'Security Monitoring',
    name: '24x7 Security Operations Center',
    description: 'Continuous monitoring, log analysis, and threat detection capabilities',
    severity: 'critical',
    status: 'running',
    progress: 30,
    findings: 0,
    compliance: true,
    automated: true,
    certInRef: 'CERT-In-SM-006'
  },
  {
    id: 'backup-recovery',
    category: 'Business Continuity',
    name: 'Backup & Disaster Recovery',
    description: 'Backup procedures, disaster recovery plans, and business continuity assessment',
    severity: 'high',
    status: 'pending',
    progress: 0,
    findings: 0,
    compliance: false,
    automated: false,
    certInRef: 'CERT-In-BC-007'
  },
  {
    id: 'security-training',
    category: 'Human Resources',
    name: 'Security Awareness Training',
    description: 'Employee security training, awareness programs, and phishing simulation',
    severity: 'medium',
    status: 'completed',
    progress: 100,
    findings: 5,
    lastRun: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    duration: '1 week',
    compliance: true,
    automated: false,
    certInRef: 'CERT-In-HR-008'
  }
];

export const AuditTools: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCheck, setSelectedCheck] = useState<AuditCheck | null>(null);
  const [runningChecks, setRunningChecks] = useState<Set<string>>(new Set());
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Shield },
    { id: 'compliance', name: 'CERT-In Compliance', icon: CheckCircle },
    { id: 'assessment', name: 'Security Assessment', icon: Target },
    { id: 'scanner', name: 'Vulnerability Scanner', icon: Eye },
    { id: 'intelligence', name: 'Threat Intelligence', icon: Globe },
    { id: 'reports', name: 'Compliance Reports', icon: FileText }
  ];

  const categories = ['all', ...Array.from(new Set(certInChecks.map(check => check.category)))];

  const filteredChecks = filterCategory === 'all' 
    ? certInChecks 
    : certInChecks.filter(check => check.category === filterCategory);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'running': return Clock;
      case 'failed': return AlertTriangle;
      default: return Play;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'running': return 'text-blue-600 bg-blue-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-50';
      case 'high': return 'border-orange-500 bg-orange-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-green-500 bg-green-50';
      default: return 'border-slate-500 bg-slate-50';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Network Security': return Network;
      case 'Access Control': return Lock;
      case 'Data Protection': return Database;
      case 'Incident Response': return AlertTriangle;
      case 'Vulnerability Management': return Eye;
      case 'Security Monitoring': return Server;
      case 'Business Continuity': return Shield;
      case 'Human Resources': return Users;
      default: return Shield;
    }
  };

  const startAuditCheck = (checkId: string) => {
    setRunningChecks(prev => new Set(prev).add(checkId));
    
    // Simulate audit check progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setRunningChecks(prev => {
          const newSet = new Set(prev);
          newSet.delete(checkId);
          return newSet;
        });
      }
    }, 1000);
  };

  const runAllCriticalChecks = () => {
    const criticalChecks = certInChecks.filter(check => 
      check.severity === 'critical' && check.status === 'pending'
    );
    criticalChecks.forEach(check => startAuditCheck(check.id));
  };

  const complianceStats = {
    total: certInChecks.length,
    compliant: certInChecks.filter(check => check.compliance).length,
    critical: certInChecks.filter(check => check.severity === 'critical' && !check.compliance).length,
    running: certInChecks.filter(check => check.status === 'running').length + runningChecks.size,
    completed: certInChecks.filter(check => check.status === 'completed').length
  };

  const overallCompliance = Math.round((complianceStats.compliant / complianceStats.total) * 100);

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Overall Compliance</p>
              <p className={`text-2xl font-bold ${
                overallCompliance >= 80 ? 'text-green-600' :
                overallCompliance >= 60 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {overallCompliance}%
              </p>
            </div>
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Checks</p>
              <p className="text-2xl font-bold text-slate-900">{complianceStats.total}</p>
            </div>
            <Target className="w-8 h-8 text-slate-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Compliant</p>
              <p className="text-2xl font-bold text-green-600">{complianceStats.compliant}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Critical Issues</p>
              <p className="text-2xl font-bold text-red-600">{complianceStats.critical}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Running</p>
              <p className="text-2xl font-bold text-blue-600">{complianceStats.running}</p>
            </div>
            <Activity className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">CERT-In Audit Checks</h3>
          <div className="flex items-center space-x-3">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
            <button
              onClick={runAllCriticalChecks}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Zap className="w-4 h-4" />
              <span>Run Critical Checks</span>
            </button>
          </div>
        </div>
      </div>

      {/* Audit Checks Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredChecks.map((check, index) => {
          const StatusIcon = getStatusIcon(check.status);
          const CategoryIcon = getCategoryIcon(check.category);
          const isRunning = runningChecks.has(check.id) || check.status === 'running';
          
          return (
            <motion.div
              key={check.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white rounded-xl shadow-sm border-l-4 p-6 hover:shadow-md transition-shadow ${getSeverityColor(check.severity)}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <CategoryIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{check.name}</h3>
                    <p className="text-sm text-slate-600">{check.category}</p>
                    <p className="text-xs text-slate-500 mt-1">{check.certInRef}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${getStatusColor(check.status)}`}>
                    <StatusIcon className="w-4 h-4" />
                    <span className="text-sm font-medium capitalize">{check.status}</span>
                  </div>
                  {check.automated && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Auto
                    </span>
                  )}
                </div>
              </div>

              <p className="text-sm text-slate-600 mb-4">{check.description}</p>

              {isRunning && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-slate-600">Progress</span>
                    <span className="font-semibold text-slate-900">{check.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <motion.div
                      className="h-2 bg-blue-600 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${check.progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm">
                  {check.findings > 0 && (
                    <div className="flex items-center space-x-1">
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                      <span className="text-orange-600 font-medium">{check.findings} findings</span>
                    </div>
                  )}
                  {check.lastRun && (
                    <span className="text-slate-500">
                      Last run: {check.lastRun.toLocaleTimeString()}
                    </span>
                  )}
                  {check.duration && (
                    <span className="text-slate-500">Duration: {check.duration}</span>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  {check.compliance ? (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Compliant
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                      Non-Compliant
                    </span>
                  )}
                  
                  {check.status === 'pending' && (
                    <button
                      onClick={() => startAuditCheck(check.id)}
                      disabled={runningChecks.has(check.id)}
                      className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Play className="w-3 h-3" />
                      <span>Run Check</span>
                    </button>
                  )}
                  
                  <button
                    onClick={() => setSelectedCheck(check)}
                    className="p-2 hover:bg-slate-100 rounded-lg"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={runAllCriticalChecks}
            className="flex items-center space-x-3 p-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            <Zap className="w-6 h-6 text-red-600" />
            <div className="text-left">
              <p className="font-medium text-red-900">Run All Critical Checks</p>
              <p className="text-sm text-red-700">Execute all critical security assessments</p>
            </div>
          </button>
          
          <button className="flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
            <FileText className="w-6 h-6 text-green-600" />
            <div className="text-left">
              <p className="font-medium text-green-900">Generate Compliance Report</p>
              <p className="text-sm text-green-700">Create CERT-In compliance documentation</p>
            </div>
          </button>
          
          <button className="flex items-center space-x-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
            <Download className="w-6 h-6 text-purple-600" />
            <div className="text-left">
              <p className="font-medium text-purple-900">Export Audit Results</p>
              <p className="text-sm text-purple-700">Download detailed audit findings</p>
            </div>
          </button>
        </div>
      </div>

      {/* Detailed Check Modal */}
      {selectedCheck && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setSelectedCheck(null)}></div>
            
            <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">{selectedCheck.name}</h3>
                <button
                  onClick={() => setSelectedCheck(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-slate-600">Category:</span>
                    <p className="font-medium text-slate-900">{selectedCheck.category}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">CERT-In Reference:</span>
                    <p className="font-medium text-slate-900">{selectedCheck.certInRef}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">Severity:</span>
                    <p className={`font-medium capitalize ${
                      selectedCheck.severity === 'critical' ? 'text-red-600' :
                      selectedCheck.severity === 'high' ? 'text-orange-600' :
                      selectedCheck.severity === 'medium' ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {selectedCheck.severity}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">Automation:</span>
                    <p className="font-medium text-slate-900">
                      {selectedCheck.automated ? 'Automated' : 'Manual'}
                    </p>
                  </div>
                </div>
                
                <div>
                  <span className="text-sm text-slate-600">Description:</span>
                  <p className="text-slate-900 mt-1">{selectedCheck.description}</p>
                </div>
                
                {selectedCheck.lastRun && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-slate-600">Last Run:</span>
                      <p className="font-medium text-slate-900">{selectedCheck.lastRun.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-sm text-slate-600">Duration:</span>
                      <p className="font-medium text-slate-900">{selectedCheck.duration}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setSelectedCheck(null)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                  {selectedCheck.status === 'pending' && (
                    <button
                      onClick={() => {
                        startAuditCheck(selectedCheck.id);
                        setSelectedCheck(null);
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Run Check
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">CERT-In Audit Tools</h1>
          <p className="text-slate-600">Comprehensive cybersecurity compliance and assessment tools</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
          <button 
            onClick={runAllCriticalChecks}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Play className="w-4 h-4" />
            <span>Run Assessment</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'compliance' && <CertInCompliance />}
        {activeTab === 'assessment' && <SecurityAssessment />}
        {activeTab === 'scanner' && <VulnerabilityScanner />}
        {activeTab === 'intelligence' && <ThreatIntelligence />}
        {activeTab === 'reports' && <ComplianceReporter />}
      </div>
    </div>
  );
};