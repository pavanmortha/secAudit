import React, { useState } from 'react';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  FileText,
  Users,
  Lock,
  Database,
  Network,
  Eye,
  Settings,
  Download
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ComplianceRequirement {
  id: string;
  category: string;
  requirement: string;
  description: string;
  status: 'compliant' | 'partial' | 'non-compliant' | 'not-assessed';
  priority: 'critical' | 'high' | 'medium' | 'low';
  evidence: string[];
  lastAssessed?: Date;
  nextDue?: Date;
  assignedTo?: string;
  progress: number;
}

const certInRequirements: ComplianceRequirement[] = [
  {
    id: 'ir-001',
    category: 'Incident Response',
    requirement: 'Incident Response Plan',
    description: 'Documented incident response procedures and escalation matrix as per CERT-In guidelines',
    status: 'compliant',
    priority: 'critical',
    evidence: ['IRP-v2.1.pdf', 'Escalation-Matrix.xlsx', 'Contact-List.pdf'],
    lastAssessed: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    nextDue: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    assignedTo: 'Security Team',
    progress: 100
  },
  {
    id: 'ir-002',
    category: 'Incident Response',
    requirement: '24x7 Incident Response Team',
    description: 'Dedicated incident response team available round the clock',
    status: 'partial',
    priority: 'critical',
    evidence: ['Team-Roster.pdf', 'Shift-Schedule.xlsx'],
    lastAssessed: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    nextDue: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    assignedTo: 'HR & Security',
    progress: 75
  },
  {
    id: 'sm-001',
    category: 'Security Monitoring',
    requirement: 'Security Operations Center (SOC)',
    description: 'Establishment of SOC for continuous monitoring and threat detection',
    status: 'compliant',
    priority: 'critical',
    evidence: ['SOC-Setup.pdf', 'Monitoring-Tools.xlsx', 'SOP-SOC.pdf'],
    lastAssessed: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    nextDue: new Date(Date.now() + 70 * 24 * 60 * 60 * 1000),
    assignedTo: 'SOC Team',
    progress: 100
  },
  {
    id: 'vm-001',
    category: 'Vulnerability Management',
    requirement: 'Regular Vulnerability Assessment',
    description: 'Quarterly vulnerability assessment and penetration testing',
    status: 'compliant',
    priority: 'high',
    evidence: ['VAPT-Q1-2024.pdf', 'Remediation-Plan.xlsx'],
    lastAssessed: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    nextDue: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    assignedTo: 'Security Team',
    progress: 100
  },
  {
    id: 'dp-001',
    category: 'Data Protection',
    requirement: 'Data Classification Policy',
    description: 'Implementation of data classification and handling procedures',
    status: 'partial',
    priority: 'high',
    evidence: ['Data-Classification-Policy.pdf'],
    lastAssessed: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    nextDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    assignedTo: 'Data Protection Officer',
    progress: 60
  },
  {
    id: 'ac-001',
    category: 'Access Control',
    requirement: 'Multi-Factor Authentication',
    description: 'Implementation of MFA for all critical systems and applications',
    status: 'non-compliant',
    priority: 'critical',
    evidence: [],
    lastAssessed: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    nextDue: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    assignedTo: 'IT Team',
    progress: 30
  },
  {
    id: 'bc-001',
    category: 'Business Continuity',
    requirement: 'Disaster Recovery Plan',
    description: 'Comprehensive disaster recovery and business continuity planning',
    status: 'partial',
    priority: 'high',
    evidence: ['DR-Plan-v1.0.pdf', 'BCP-Procedures.docx'],
    lastAssessed: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    nextDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    assignedTo: 'Business Continuity Team',
    progress: 70
  },
  {
    id: 'st-001',
    category: 'Security Training',
    requirement: 'Security Awareness Program',
    description: 'Regular security awareness training and phishing simulation exercises',
    status: 'compliant',
    priority: 'medium',
    evidence: ['Training-Records.xlsx', 'Phishing-Sim-Results.pdf', 'Certificates.pdf'],
    lastAssessed: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    nextDue: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    assignedTo: 'HR & Security Team',
    progress: 100
  },
  {
    id: 'ns-001',
    category: 'Network Security',
    requirement: 'Network Segmentation',
    description: 'Proper network segmentation and firewall implementation',
    status: 'partial',
    priority: 'high',
    evidence: ['Network-Diagram.pdf', 'Firewall-Rules.xlsx'],
    lastAssessed: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    nextDue: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
    assignedTo: 'Network Team',
    progress: 80
  },
  {
    id: 'st-001',
    category: 'Security Training',
    requirement: 'Security Awareness Training',
    description: 'Regular security awareness training for all employees',
    status: 'compliant',
    priority: 'medium',
    evidence: ['Training-Records.xlsx', 'Certificates.pdf'],
    lastAssessed: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    nextDue: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    assignedTo: 'HR Team',
    progress: 100
  }
];

export const CertInCompliance: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRequirement, setSelectedRequirement] = useState<ComplianceRequirement | null>(null);

  const categories = ['all', ...Array.from(new Set(certInRequirements.map(req => req.category)))];

  const filteredRequirements = selectedCategory === 'all' 
    ? certInRequirements 
    : certInRequirements.filter(req => req.category === selectedCategory);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-green-600 bg-green-100';
      case 'partial': return 'text-yellow-600 bg-yellow-100';
      case 'non-compliant': return 'text-red-600 bg-red-100';
      case 'not-assessed': return 'text-slate-600 bg-slate-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': return CheckCircle;
      case 'partial': return Clock;
      case 'non-compliant': return AlertTriangle;
      case 'not-assessed': return Eye;
      default: return Clock;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-red-500 bg-red-50';
      case 'high': return 'border-orange-500 bg-orange-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-green-500 bg-green-50';
      default: return 'border-slate-500 bg-slate-50';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Incident Response': return AlertTriangle;
      case 'Security Monitoring': return Eye;
      case 'Vulnerability Management': return Shield;
      case 'Data Protection': return Database;
      case 'Access Control': return Lock;
      case 'Network Security': return Network;
      case 'Security Training': return Users;
      default: return FileText;
    }
  };

  const complianceStats = {
    total: certInRequirements.length,
    compliant: certInRequirements.filter(req => req.status === 'compliant').length,
    partial: certInRequirements.filter(req => req.status === 'partial').length,
    nonCompliant: certInRequirements.filter(req => req.status === 'non-compliant').length,
    notAssessed: certInRequirements.filter(req => req.status === 'not-assessed').length
  };

  const overallCompliance = Math.round(
    ((complianceStats.compliant + complianceStats.partial * 0.5) / complianceStats.total) * 100
  );

  return (
    <div className="space-y-6">
      {/* Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{overallCompliance}%</div>
            <div className="text-sm text-slate-600">Overall Compliance</div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-bold text-green-600">{complianceStats.compliant}</div>
              <div className="text-xs text-slate-600">Compliant</div>
            </div>
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-bold text-yellow-600">{complianceStats.partial}</div>
              <div className="text-xs text-slate-600">Partial</div>
            </div>
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-bold text-red-600">{complianceStats.nonCompliant}</div>
              <div className="text-xs text-slate-600">Non-Compliant</div>
            </div>
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-bold text-slate-600">{complianceStats.notAssessed}</div>
              <div className="text-xs text-slate-600">Not Assessed</div>
            </div>
            <Eye className="w-6 h-6 text-slate-600" />
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">CERT-In Compliance Requirements</h3>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            <Download className="w-4 h-4" />
            <span>Export Compliance Report</span>
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {category === 'all' ? 'All Categories' : category}
            </button>
          ))}
        </div>
      </div>

      {/* Requirements List */}
      <div className="space-y-4">
        {filteredRequirements.map((requirement, index) => {
          const StatusIcon = getStatusIcon(requirement.status);
          const CategoryIcon = getCategoryIcon(requirement.category);
          
          return (
            <motion.div
              key={requirement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white rounded-xl shadow-sm border-l-4 p-6 hover:shadow-md transition-shadow ${getPriorityColor(requirement.priority)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <CategoryIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-semibold text-slate-900">{requirement.requirement}</h4>
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                        {requirement.id}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(requirement.status)}`}>
                        {requirement.status.replace('-', ' ')}
                      </span>
                    </div>
                    
                    <p className="text-sm text-slate-600 mb-3">{requirement.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-slate-500">Category:</span>
                        <span className="ml-2 font-medium text-slate-900">{requirement.category}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Priority:</span>
                        <span className={`ml-2 font-medium capitalize ${
                          requirement.priority === 'critical' ? 'text-red-600' :
                          requirement.priority === 'high' ? 'text-orange-600' :
                          requirement.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {requirement.priority}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Assigned to:</span>
                        <span className="ml-2 font-medium text-slate-900">{requirement.assignedTo}</span>
                      </div>
                    </div>
                    
                    {requirement.progress < 100 && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-slate-600">Progress</span>
                          <span className="font-semibold text-slate-900">{requirement.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className="h-2 bg-blue-600 rounded-full transition-all duration-300"
                            style={{ width: `${requirement.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                    
                    {requirement.evidence.length > 0 && (
                      <div className="mt-3">
                        <span className="text-sm text-slate-500">Evidence:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {requirement.evidence.map((evidence, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                            >
                              <FileText className="w-3 h-3" />
                              <span>{evidence}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(requirement.status)}`}>
                    <StatusIcon className="w-4 h-4" />
                  </div>
                  <button
                    onClick={() => setSelectedRequirement(requirement)}
                    className="p-2 hover:bg-slate-100 rounded-lg"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>
              
              {(requirement.lastAssessed || requirement.nextDue) && (
                <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-500">
                  {requirement.lastAssessed && (
                    <span>Last assessed: {requirement.lastAssessed.toLocaleDateString()}</span>
                  )}
                  {requirement.nextDue && (
                    <span className={`font-medium ${
                      requirement.nextDue < new Date() ? 'text-red-600' : 'text-slate-600'
                    }`}>
                      Next due: {requirement.nextDue.toLocaleDateString()}
                    </span>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};