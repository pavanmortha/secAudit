import React, { useState } from 'react';
import { FileText, Download, Calendar, Filter } from 'lucide-react';
import { LoadingSpinner } from '../Common/LoadingSpinner';
import { reportsApi } from '../../services/api';
import toast from 'react-hot-toast';

interface ReportGeneratorProps {
  onReportGenerated?: () => void;
}

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({ onReportGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportConfig, setReportConfig] = useState({
    type: 'audit_summary',
    format: 'pdf',
    dateRange: '30',
    includeCharts: true,
    includeDetails: true
  });

  const reportTypes = [
    { value: 'audit_summary', label: 'Audit Summary Report', description: 'Comprehensive audit overview' },
    { value: 'vulnerability_report', label: 'Vulnerability Report', description: 'Detailed vulnerability findings' },
    { value: 'compliance_report', label: 'Compliance Report', description: 'Regulatory compliance status' },
    { value: 'executive_summary', label: 'Executive Summary', description: 'High-level security overview' }
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await reportsApi.generate(reportConfig.type, {
        format: reportConfig.format,
        dateRange: parseInt(reportConfig.dateRange),
        includeCharts: reportConfig.includeCharts,
        includeDetails: reportConfig.includeDetails
      });
      
      toast.success('Report generated successfully!');
      if (onReportGenerated) {
        onReportGenerated();
      }
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfigChange = (key: string, value: any) => {
    setReportConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <FileText className="w-6 h-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-slate-900">Generate Report</h3>
      </div>

      <div className="space-y-6">
        {/* Report Type Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Report Type
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {reportTypes.map((type) => (
              <label
                key={type.value}
                className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                  reportConfig.type === type.value
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-slate-300 bg-white hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="reportType"
                  value={type.value}
                  checked={reportConfig.type === type.value}
                  onChange={(e) => handleConfigChange('type', e.target.value)}
                  className="sr-only"
                />
                <div className="flex-1">
                  <div className="flex items-center">
                    <div className="text-sm">
                      <p className="font-medium text-slate-900">{type.label}</p>
                      <p className="text-slate-500">{type.description}</p>
                    </div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Configuration Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Format
            </label>
            <select
              value={reportConfig.format}
              onChange={(e) => handleConfigChange('format', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="pdf">PDF</option>
              <option value="html">HTML</option>
              <option value="xlsx">Excel</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Date Range (Days)
            </label>
            <select
              value={reportConfig.dateRange}
              onChange={(e) => handleConfigChange('dateRange', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
          </div>

          <div className="flex flex-col justify-end">
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={reportConfig.includeCharts}
                  onChange={(e) => handleConfigChange('includeCharts', e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-slate-700">Include Charts</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={reportConfig.includeDetails}
                  onChange={(e) => handleConfigChange('includeDetails', e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-slate-700">Include Details</span>
              </label>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex justify-end pt-4 border-t border-slate-200">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Generate Report</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};