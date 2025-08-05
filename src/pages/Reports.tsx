import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Plus, 
  Search, 
  Filter,
  Calendar,
  Eye,
  Share2
} from 'lucide-react';
import { Modal } from '../components/Common/Modal';
import { ReportGenerator } from '../components/Reports/ReportGenerator';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../services/api';

interface Report {
  id: string;
  title: string;
  type: 'audit_summary' | 'vulnerability_report' | 'compliance_report' | 'executive_summary';
  auditId?: string;
  generatedDate: Date;
  generatedBy: string;
  status: 'draft' | 'final' | 'approved';
  fileSize: string;
  format: 'pdf' | 'html' | 'xlsx';
}

export const Reports: React.FC = () => {
  const { data: reports = [], isLoading, refetch } = useQuery({
    queryKey: ['reports'],
    queryFn: () => reportsApi.getAll().then(res => res.data),
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.generatedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || report.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'audit_summary': return 'bg-blue-100 text-blue-800';
      case 'vulnerability_report': return 'bg-red-100 text-red-800';
      case 'compliance_report': return 'bg-green-100 text-green-800';
      case 'executive_summary': return 'bg-purple-100 text-purple-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'final': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const formatType = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Audit Reports</h1>
          <p className="text-slate-600">Generate and manage security audit reports</p>
        </div>
        <button 
          onClick={() => setShowGenerateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Generate Report</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="audit_summary">Audit Summary</option>
                <option value="vulnerability_report">Vulnerability Report</option>
                <option value="compliance_report">Compliance Report</option>
                <option value="executive_summary">Executive Summary</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button 
          onClick={() => setShowGenerateModal(true)}
          className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-6 hover:border-blue-400 hover:bg-blue-50 transition-colors"
        >
          <div className="text-center">
            <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-900">Audit Summary</p>
            <p className="text-xs text-slate-600">Generate comprehensive audit report</p>
          </div>
        </button>
        <button 
          onClick={() => setShowGenerateModal(true)}
          className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-6 hover:border-red-400 hover:bg-red-50 transition-colors"
        >
          <div className="text-center">
            <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-900">Vulnerability Report</p>
            <p className="text-xs text-slate-600">Export vulnerability findings</p>
          </div>
        </button>
        <button 
          onClick={() => setShowGenerateModal(true)}
          className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-6 hover:border-green-400 hover:bg-green-50 transition-colors"
        >
          <div className="text-center">
            <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-900">Compliance Report</p>
            <p className="text-xs text-slate-600">Generate compliance overview</p>
          </div>
        </button>
        <button 
          onClick={() => setShowGenerateModal(true)}
          className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-6 hover:border-purple-400 hover:bg-purple-50 transition-colors"
        >
          <div className="text-center">
            <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-900">Executive Summary</p>
            <p className="text-xs text-slate-600">High-level security overview</p>
          </div>
        </button>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.map((report) => (
          <div key={report.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-slate-900">{report.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(report.type)}`}>
                      {formatType(report.type)}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-6 text-sm text-slate-600">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Generated: {report.generatedDate.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>By: {report.generatedBy}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>Size: {report.fileSize}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>Format: {report.format.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-6">
                <button className="p-2 hover:bg-slate-100 rounded-lg" title="Preview">
                  <Eye className="w-4 h-4 text-slate-400" />
                </button>
                <button className="p-2 hover:bg-slate-100 rounded-lg" title="Share">
                  <Share2 className="w-4 h-4 text-slate-400" />
                </button>
                <button className="flex items-center space-x-2 px-3 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors">
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">No reports found matching your criteria</p>
        </div>
      )}

      {/* Report Generator Modal */}
      <Modal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        title="Generate New Report"
        size="lg"
      >
        <ReportGenerator
          onReportGenerated={() => {
            setShowGenerateModal(false);
            refetch();
          }}
        />
      </Modal>
    </div>
  );
};