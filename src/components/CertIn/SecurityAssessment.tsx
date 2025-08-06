import React, { useState } from 'react';
import { 
  Target, 
  Play, 
  Pause, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  Shield,
  Network,
  Lock,
  Database,
  Globe,
  Server,
  Eye,
  Settings
} from 'lucide-react';
import { motion } from 'framer-motion';

interface AssessmentModule {
  id: string;
  name: string;
  category: string;
  description: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  progress: number;
  findings: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  lastRun?: Date;
  duration: string;
  automated: boolean;
}

const assessmentModules: AssessmentModule[] = [
  {
    id: 'network-scan',
    name: 'Network Infrastructure Scan',
    category: 'Network Security',
    description: 'Comprehensive network discovery, port scanning, and service enumeration',
    status: 'completed',
    progress: 100,
    findings: { critical: 2, high: 5, medium: 12, low: 8 },
    lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000),
    duration: '45 minutes',
    automated: true
  },
  {
    id: 'web-app-scan',
    name: 'Web Application Security Test',
    category: 'Application Security',
    description: 'OWASP Top 10 vulnerabilities and web application security assessment',
    status: 'running',
    progress: 65,
    findings: { critical: 1, high: 3, medium: 7, low: 4 },
    duration: '2 hours',
    automated: true
  },
  {
    id: 'database-audit',
    name: 'Database Security Audit',
    category: 'Data Security',
    description: 'Database configuration, access controls, and data protection assessment',
    status: 'idle',
    progress: 0,
    findings: { critical: 0, high: 0, medium: 0, low: 0 },
    duration: '1.5 hours',
    automated: true
  },
  {
    id: 'access-review',
    name: 'Access Control Review',
    category: 'Identity & Access',
    description: 'User access rights, privilege escalation, and authentication mechanisms review',
    status: 'completed',
    progress: 100,
    findings: { critical: 3, high: 6, medium: 9, low: 5 },
    lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000),
    duration: '3 hours',
    automated: false
  },
  {
    id: 'config-audit',
    name: 'System Configuration Audit',
    category: 'System Security',
    description: 'Operating system hardening, security configurations, and compliance checks',
    status: 'idle',
    progress: 0,
    findings: { critical: 0, high: 0, medium: 0, low: 0 },
    duration: '2.5 hours',
    automated: true
  },
  {
    id: 'social-eng',
    name: 'Social Engineering Assessment',
    category: 'Human Factor',
    description: 'Phishing simulation, security awareness, and human vulnerability testing',
    status: 'completed',
    progress: 100,
    findings: { critical: 1, high: 2, medium: 8, low: 15 },
    lastRun: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    duration: '1 week',
    automated: false
  }
];

export const SecurityAssessment: React.FC = () => {
  const [runningModules, setRunningModules] = useState<Set<string>>(new Set());
  const [selectedModule, setSelectedModule] = useState<AssessmentModule | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'running': return 'text-blue-600 bg-blue-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'running': return Clock;
      case 'failed': return AlertTriangle;
      default: return Play;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Network Security': return Network;
      case 'Application Security': return Globe;
      case 'Data Security': return Database;
      case 'Identity & Access': return Lock;
      case 'System Security': return Server;
      case 'Human Factor': return Eye;
      default: return Shield;
    }
  };

  const startAssessment = (moduleId: string) => {
    setRunningModules(prev => new Set(prev).add(moduleId));
    // Simulate assessment progress
    setTimeout(() => {
      setRunningModules(prev => {
        const newSet = new Set(prev);
        newSet.delete(moduleId);
        return newSet;
      });
    }, 10000);
  };

  const totalFindings = assessmentModules.reduce((acc, module) => ({
    critical: acc.critical + module.findings.critical,
    high: acc.high + module.findings.high,
    medium: acc.medium + module.findings.medium,
    low: acc.low + module.findings.low
  }), { critical: 0, high: 0, medium: 0, low: 0 });

  return (
    <div className="space-y-6">
      {/* Assessment Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="text-center">
            <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-slate-900">{assessmentModules.length}</div>
            <div className="text-sm text-slate-600">Total Modules</div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="text-center">
            <div className="text-lg font-bold text-red-600">{totalFindings.critical}</div>
            <div className="text-xs text-slate-600">Critical</div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="text-center">
            <div className="text-lg font-bold text-orange-600">{totalFindings.high}</div>
            <div className="text-xs text-slate-600">High</div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-600">{totalFindings.medium}</div>
            <div className="text-xs text-slate-600">Medium</div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{totalFindings.low}</div>
            <div className="text-xs text-slate-600">Low</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Assessment Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
            <Play className="w-6 h-6 text-blue-600" />
            <div className="text-left">
              <p className="font-medium text-blue-900">Run All Automated</p>
              <p className="text-sm text-blue-700">Execute all automated security assessments</p>
            </div>
          </button>
          
          <button className="flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
            <Target className="w-6 h-6 text-green-600" />
            <div className="text-left">
              <p className="font-medium text-green-900">Custom Assessment</p>
              <p className="text-sm text-green-700">Configure and run targeted security tests</p>
            </div>
          </button>
          
          <button className="flex items-center space-x-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
            <Settings className="w-6 h-6 text-purple-600" />
            <div className="text-left">
              <p className="font-medium text-purple-900">Schedule Assessments</p>
              <p className="text-sm text-purple-700">Set up recurring security assessments</p>
            </div>
          </button>
        </div>
      </div>

      {/* Assessment Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {assessmentModules.map((module, index) => {
          const StatusIcon = getStatusIcon(module.status);
          const CategoryIcon = getCategoryIcon(module.category);
          const isRunning = runningModules.has(module.id) || module.status === 'running';
          
          return (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <CategoryIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{module.name}</h3>
                    <p className="text-sm text-slate-600">{module.category}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${getStatusColor(module.status)}`}>
                    <StatusIcon className="w-4 h-4" />
                    <span className="text-sm font-medium capitalize">{module.status}</span>
                  </div>
                  {module.automated && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Auto
                    </span>
                  )}
                </div>
              </div>

              <p className="text-sm text-slate-600 mb-4">{module.description}</p>

              {isRunning && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-slate-600">Progress</span>
                    <span className="font-semibold text-slate-900">{module.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <motion.div
                      className="h-2 bg-blue-600 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${module.progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              )}

              {module.status === 'completed' && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-slate-900 mb-2">Findings Summary</h4>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-center p-2 bg-red-50 rounded">
                      <div className="text-sm font-bold text-red-600">{module.findings.critical}</div>
                      <div className="text-xs text-red-600">Critical</div>
                    </div>
                    <div className="text-center p-2 bg-orange-50 rounded">
                      <div className="text-sm font-bold text-orange-600">{module.findings.high}</div>
                      <div className="text-xs text-orange-600">High</div>
                    </div>
                    <div className="text-center p-2 bg-yellow-50 rounded">
                      <div className="text-sm font-bold text-yellow-600">{module.findings.medium}</div>
                      <div className="text-xs text-yellow-600">Medium</div>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded">
                      <div className="text-sm font-bold text-green-600">{module.findings.low}</div>
                      <div className="text-xs text-green-600">Low</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-500">
                  <span>Duration: {module.duration}</span>
                  {module.lastRun && (
                    <span className="ml-4">Last run: {module.lastRun.toLocaleTimeString()}</span>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  {module.status === 'idle' && (
                    <button
                      onClick={() => startAssessment(module.id)}
                      disabled={runningModules.has(module.id)}
                      className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Play className="w-3 h-3" />
                      <span>Start</span>
                    </button>
                  )}
                  
                  {isRunning && (
                    <button className="flex items-center space-x-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors">
                      <Pause className="w-3 h-3" />
                      <span>Stop</span>
                    </button>
                  )}
                  
                  <button
                    onClick={() => setSelectedModule(module)}
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
    </div>
  );
};