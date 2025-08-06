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
  Eye
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
    compliance: false
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
    compliance: true
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
    compliance: true
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
    compliance: true
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
    compliance: false
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
    compliance: true
  }
];

export const AuditTools: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCheck, setSelectedCheck] = useState<AuditCheck | null>(null);
  const [runningChecks, setRunningChecks] = useState<Set<string>>(new Set());

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Shield },
    { id: 'compliance', name: 'CERT-In Compliance', icon: CheckCircle },
    { id: 'assessment', name: 'Security Assessment', icon: Target },
    { id: 'scanner', name: 'Vulnerability Scanner', icon: Eye },
    { id: 'intelligence', name: 'Threat Intelligence', icon: Globe },
    { id: 'reports', name: 'Compliance Reports', icon: FileText }
  ];

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
      default: return Shield;
    }
  };

  const startAuditCheck = (checkId: string) => {
    setRunningChecks(prev => new Set(prev).add(checkId));
    // Simulate audit check progress
    setTimeout(() => {
      setRunningChecks(prev => {
        const newSet = new Set(prev);
        newSet.delete(checkId);
        return newSet;
      });
    }, 5000);
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Checks</p>
              <p className="text-2xl font-bold text-slate-900">{certInChecks.length}</p>
            </div>
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Compliant</p>
              <p className="text-2xl font-bold text-green-600">
                {certInChecks.filter(c => c.compliance).length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Critical Issues</p>
              <p className="text-2xl font-bold text-red-600">
                {certInChecks.filter(c => c.severity === 'critical' && !c.compliance).length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Running</p>
              <p className="text-2xl font-bold text-blue-600">
                {certInChecks.filter(c => c.status === 'running').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Audit Checks Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {certInChecks.map((check, index) => {
          const StatusIcon = getStatusIcon(check.status);
          const CategoryIcon = getCategoryIcon(check.category);
          
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
                  </div>
                </div>
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${getStatusColor(check.status)}`}>
                  <StatusIcon className="w-4 h-4" />
                  <span className="text-sm font-medium capitalize">{check.status}</span>
                </div>
              </div>

              <p className="text-sm text-slate-600 mb-4">{check.description}</p>

              {check.status === 'running' && (
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
          <button className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
            <Play className="w-6 h-6 text-blue-600" />
            <div className="text-left">
              <p className="font-medium text-blue-900">Run All Critical Checks</p>
              <p className="text-sm text-blue-700">Execute all critical security assessments</p>
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
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
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
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
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