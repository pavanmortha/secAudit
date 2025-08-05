import React, { useState } from 'react';
import { 
  Calendar, 
  Plus, 
  Search, 
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  User
} from 'lucide-react';
import { Modal } from '../components/Common/Modal';
import { AuditForm } from '../components/Forms/AuditForm';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { auditsApi } from '../services/api';
import { Audit } from '../types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export const Audits: React.FC = () => {
  const queryClient = useQueryClient();
  
  const { data: audits = [], isLoading: loading } = useQuery({
    queryKey: ['audits'],
    queryFn: () => auditsApi.getAll().then(res => res.data),
  });

  const createMutation = useMutation({
    mutationFn: auditsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audits'] });
      toast.success('Audit created successfully');
    },
    onError: () => {
      toast.error('Failed to create audit');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Audit> }) =>
      auditsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audits'] });
      toast.success('Audit updated successfully');
    },
    onError: () => {
      toast.error('Failed to update audit');
    },
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingAudit, setEditingAudit] = useState<Audit | null>(null);

  const filteredAudits = audits.filter(audit => {
    const matchesSearch = audit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         audit.type.includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || audit.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'in_progress': return Clock;
      case 'scheduled': return Calendar;
      case 'cancelled': return AlertCircle;
      default: return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getAuditTypeColor = (type: string) => {
    switch (type) {
      case 'vapt': return 'bg-purple-100 text-purple-800';
      case 'config_audit': return 'bg-blue-100 text-blue-800';
      case 'red_team': return 'bg-red-100 text-red-800';
      case 'code_review': return 'bg-green-100 text-green-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const handleCreateAudit = async (auditData: Partial<Audit>) => {
    try {
      await createMutation.mutateAsync(auditData);
      setShowModal(false);
    } catch (error) {
      console.error('Failed to create audit:', error);
    }
  };

  const handleUpdateAudit = async (auditData: Partial<Audit>) => {
    if (!editingAudit) return;
    
    try {
      await updateMutation.mutateAsync({
        id: editingAudit.id,
        data: auditData,
      });
      setEditingAudit(null);
      setShowModal(false);
    } catch (error) {
      console.error('Failed to update audit:', error);
    }
  };

  const openCreateModal = () => {
    setEditingAudit(null);
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Audit Management</h1>
          <p className="text-slate-600">Schedule and track security audits</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Audit</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search audits..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Audits List */}
      <div className="space-y-4">
        {filteredAudits.map((audit) => {
          const StatusIcon = getStatusIcon(audit.status);
          return (
            <div key={audit.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <StatusIcon className="w-5 h-5 text-slate-400" />
                    <h3 className="text-lg font-semibold text-slate-900">{audit.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(audit.status)}`}>
                      {audit.status.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getAuditTypeColor(audit.type)}`}>
                      {audit.type.toUpperCase().replace('_', ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-slate-600">Scheduled Date</p>
                      <p className="text-sm font-medium text-slate-900">
                        {format(new Date(audit.scheduledDate), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Frequency</p>
                      <p className="text-sm font-medium text-slate-900 capitalize">
                        {audit.frequency.replace('_', ' ')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Assets Count</p>
                      <p className="text-sm font-medium text-slate-900">
                        {audit.assetIds.length} assets
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Documents</p>
                      <p className="text-sm font-medium text-slate-900">
                        {audit.documents?.length || 0} files
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {audit.scope.map((item, index) => (
                      <span key={index} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-6">
                  <button className="p-2 hover:bg-slate-100 rounded-lg">
                    <FileText className="w-4 h-4 text-slate-400" />
                  </button>
                  <button className="p-2 hover:bg-slate-100 rounded-lg">
                    <User className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredAudits.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">No audits found matching your criteria</p>
        </div>
      )}

      {/* Audit Form Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingAudit(null);
        }}
        title={editingAudit ? 'Edit Audit' : 'Schedule New Audit'}
        size="lg"
      >
        <AuditForm
          audit={editingAudit || undefined}
          onSubmit={editingAudit ? handleUpdateAudit : handleCreateAudit}
          onCancel={() => {
            setShowModal(false);
            setEditingAudit(null);
          }}
          isLoading={loading}
        />
      </Modal>
    </div>
  );
};