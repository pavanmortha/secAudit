import React, { useState } from 'react';
import { 
  Bug, 
  Plus, 
  Search, 
  Filter,
  AlertTriangle,
  Clock,
  CheckCircle,
  User,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { Modal } from '../components/Common/Modal';
import { VulnerabilityForm } from '../components/Forms/VulnerabilityForm';
import { useVulnerabilities } from '../hooks/useVulnerabilities';
import { Vulnerability } from '../types';
import { format } from 'date-fns';

export const Vulnerabilities: React.FC = () => {
  const { vulnerabilities, loading, createVulnerability, updateVulnerability } = useVulnerabilities();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingVulnerability, setEditingVulnerability] = useState<Vulnerability | null>(null);

  const filteredVulnerabilities = vulnerabilities.filter(vuln => {
    const matchesSearch = vuln.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vuln.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vuln.cveId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = filterSeverity === 'all' || vuln.severity === filterSeverity;
    const matchesStatus = filterStatus === 'all' || vuln.status === filterStatus;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'false_positive': return 'bg-slate-100 text-slate-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return AlertTriangle;
      default:
        return Bug;
    }
  };

  const handleCreateVulnerability = async (vulnData: Partial<Vulnerability>) => {
    try {
      await createVulnerability({
        ...vulnData,
        auditId: '1', // Default audit ID for demo
        assetId: '1'  // Default asset ID for demo
      });
      setShowModal(false);
    } catch (error) {
      console.error('Failed to create vulnerability:', error);
    }
  };

  const handleUpdateVulnerability = async (vulnData: Partial<Vulnerability>) => {
    if (!editingVulnerability) return;
    
    try {
      await updateVulnerability(editingVulnerability.id, vulnData);
      setEditingVulnerability(null);
      setShowModal(false);
    } catch (error) {
      console.error('Failed to update vulnerability:', error);
    }
  };

  const openCreateModal = () => {
    setEditingVulnerability(null);
    setShowModal(true);
  };

  const openEditModal = (vulnerability: Vulnerability) => {
    setEditingVulnerability(vulnerability);
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Vulnerability Management</h1>
          <p className="text-slate-600">Track and remediate security vulnerabilities</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Vulnerability</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search vulnerabilities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
                <option value="info">Info</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="false_positive">False Positive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Vulnerabilities List */}
      <div className="space-y-4">
        {filteredVulnerabilities.map((vuln) => {
          const SeverityIcon = getSeverityIcon(vuln.severity);
          return (
            <div key={vuln.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4 flex-1">
                  <div className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center ${getSeverityColor(vuln.severity)}`}>
                    <SeverityIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">{vuln.title}</h3>
                      {vuln.cveId && (
                        <a 
                          href={`https://cve.mitre.org/cgi-bin/cvename.cgi?name=${vuln.cveId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                        >
                          <span>{vuln.cveId}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <p className="text-slate-600 mb-3">{vuln.description}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-600">CVSS:</span>
                        <span className="font-semibold text-slate-900">{vuln.cvssScore}</span>
                      </div>
                      {vuln.epssScore && (
                        <div className="flex items-center space-x-2">
                          <span className="text-slate-600">EPSS:</span>
                          <span className="font-semibold text-slate-900">{(vuln.epssScore * 100).toFixed(1)}%</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-600">Category:</span>
                        <span className="font-semibold text-slate-900">{vuln.category}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-600">
                          Discovered: {format(new Date(vuln.discoveredDate), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 text-sm rounded-full ${getSeverityColor(vuln.severity)}`}>
                    {vuln.severity}
                  </span>
                  <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(vuln.status)}`}>
                    {vuln.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {(vuln.assignedTo || vuln.dueDate) && (
                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <div className="flex items-center space-x-4">
                    {vuln.assignedTo && (
                      <div className="flex items-center space-x-2 text-sm text-slate-600">
                        <User className="w-4 h-4" />
                        <span>Assigned to: <strong>{vuln.assignedTo}</strong></span>
                      </div>
                    )}
                    {vuln.dueDate && (
                      <div className="flex items-center space-x-2 text-sm text-slate-600">
                        <Clock className="w-4 h-4" />
                        <span>Due: <strong>{format(new Date(vuln.dueDate), 'MMM dd, yyyy')}</strong></span>
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors">
                      View Details
                    </button>
                    <button 
                      onClick={() => openEditModal(vuln)}
                      className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors"
                    >
                      Update Status
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredVulnerabilities.length === 0 && (
        <div className="text-center py-12">
          <Bug className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">No vulnerabilities found matching your criteria</p>
        </div>
      )}

      {/* Vulnerability Form Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingVulnerability(null);
        }}
        title={editingVulnerability ? 'Edit Vulnerability' : 'Add New Vulnerability'}
        size="xl"
      >
        <VulnerabilityForm
          vulnerability={editingVulnerability || undefined}
          onSubmit={editingVulnerability ? handleUpdateVulnerability : handleCreateVulnerability}
          onCancel={() => {
            setShowModal(false);
            setEditingVulnerability(null);
          }}
          isLoading={loading}
        />
      </Modal>
    </div>
  );
};