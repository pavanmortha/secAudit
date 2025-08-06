import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Calendar, 
  CheckCircle,
  AlertTriangle,
  Clock,
  Shield,
  Target,
  BarChart3,
  PieChart,
  TrendingUp,
  Filter
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ComplianceReport {
  id: string;
  title: string;
  type: 'cert-in' | 'iso27001' | 'nist' | 'custom';
  status: 'draft' | 'final' | 'approved';
  complianceScore: number;
  generatedDate: Date;
  generatedBy: string;
  sections: {
    name: string;
    score: number;
    findings: number;
    status: 'pass' | 'fail' | 'partial';
  }[];
  recommendations: string[];
  fileSize: string;
}

const mockReports: ComplianceReport[] = [
  {
    id: 'report-1',
    title: 'CERT-In Compliance Assessment Q1 2024',
    type: 'cert-in',
    status: 'final',
    complianceScore: 78,
    generatedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    generatedBy: 'Security Team',
    sections: [
      { name: 'Incident Response', score: 85, findings: 2, status: 'pass' },
      { name: 'Security Monitoring', score: 90, findings: 1, status: 'pass' },
      { name: 'Vulnerability Management', score: 75, findings: 5, status: 'partial' },
      { name: 'Access Control', score: 60, findings: 8, status: 'fail' },
      { name: 'Data Protection', score: 80, findings: 3, status: 'pass' }
    ],
    recommendations: [
      'Implement multi-factor authentication across all systems',
      'Enhance network segmentation for critical assets',
      'Establish 24x7 security operations center',
      'Conduct regular security awareness training'
    ],
    fileSize: '2.3 MB'
  },
  {
    id: 'report-2',
    title: 'ISO 27001 Gap Analysis Report',
    type: 'iso27001',
    status: 'draft',
    complianceScore: 65,
    generatedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    generatedBy: 'Compliance Officer',
    sections: [
      { name: 'Information Security Policy', score: 70, findings: 3, status: 'partial' },
      { name: 'Risk Management', score: 80, findings: 2, status: 'pass' },
      { name: 'Asset Management', score: 55, findings: 7, status: 'fail' },
      { name: 'Human Resource Security', score: 75, findings: 4, status: 'partial' }
    ],
    recommendations: [
      'Develop comprehensive asset inventory',
      'Implement risk assessment procedures',
      'Enhance employee security training program'
    ],
    fileSize: '1.8 MB'
  }
];

export const ComplianceReporter: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<ComplianceReport | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportConfig, setReportConfig] = useState({
    type: 'cert-in',
    includeCharts: true,
    includeRecommendations: true,
    format: 'pdf'
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'text-green-600 bg-green-100';
      case 'fail': return 'text-red-600 bg-red-100';
      case 'partial': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case 'cert-in': return 'bg-blue-100 text-blue-800';
      case 'iso27001': return 'bg-green-100 text-green-800';
      case 'nist': return 'bg-purple-100 text-purple-800';
      case 'custom': return 'bg-orange-100 text-orange-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const generateReport = async () => {
    setIsGenerating(true);
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Report Generation */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Generate Compliance Report</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Framework</label>
            <select
              value={reportConfig.type}
              onChange={(e) => setReportConfig(prev => ({ ...prev, type: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="cert-in">CERT-In Guidelines</option>
              <option value="iso27001">ISO 27001</option>
              <option value="nist">NIST Framework</option>
              <option value="custom">Custom Assessment</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Format</label>
            <select
              value={reportConfig.format}
              onChange={(e) => setReportConfig(prev => ({ ...prev, format: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="pdf">PDF Report</option>
              <option value="html">HTML Report</option>
              <option value="xlsx">Excel Workbook</option>
              <option value="json">JSON Data</option>
            </select>
          </div>
          
          <div className="flex flex-col justify-end">
            <label className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={reportConfig.includeCharts}
                onChange={(e) => setReportConfig(prev => ({ ...prev, includeCharts: e.target.checked }))}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-slate-700">Include Charts</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={reportConfig.includeRecommendations}
                onChange={(e) => setReportConfig(prev => ({ ...prev, includeRecommendations: e.target.checked }))}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-slate-700">Include Recommendations</span>
            </label>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={generateReport}
              disabled={isGenerating}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>Generate</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Existing Reports */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Compliance Reports</h3>
        
        <div className="space-y-4">
          {mockReports.map((report, index) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-semibold text-slate-900">{report.title}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${getReportTypeColor(report.type)}`}>
                      {report.type.toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      report.status === 'approved' ? 'bg-green-100 text-green-800' :
                      report.status === 'final' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {report.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-6 text-sm text-slate-600 mb-4">
                    <span>Generated: {report.generatedDate.toLocaleDateString()}</span>
                    <span>By: {report.generatedBy}</span>
                    <span>Size: {report.fileSize}</span>
                    <span className={`font-medium ${
                      report.complianceScore >= 80 ? 'text-green-600' :
                      report.complianceScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      Compliance: {report.complianceScore}%
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    {report.sections.map((section, idx) => (
                      <div key={idx} className="text-center p-3 bg-slate-50 rounded-lg">
                        <div className={`text-lg font-bold ${
                          section.status === 'pass' ? 'text-green-600' :
                          section.status === 'fail' ? 'text-red-600' : 'text-yellow-600'
                        }`}>
                          {section.score}%
                        </div>
                        <div className="text-xs text-slate-600">{section.name}</div>
                        <div className="text-xs text-slate-500">{section.findings} findings</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-6">
                  <button
                    onClick={() => setSelectedReport(report)}
                    className="flex items-center space-x-1 px-3 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    <span>View</span>
                  </button>
                  <button className="flex items-center space-x-1 px-3 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors">
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Report Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setSelectedReport(null)}></div>
            
            <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">{selectedReport.title}</h3>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{selectedReport.complianceScore}%</div>
                    <div className="text-sm text-slate-600">Overall Compliance</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {selectedReport.sections.filter(s => s.status === 'pass').length}
                    </div>
                    <div className="text-sm text-slate-600">Sections Passed</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {selectedReport.sections.reduce((acc, s) => acc + s.findings, 0)}
                    </div>
                    <div className="text-sm text-slate-600">Total Findings</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-slate-900 mb-4">Section Details</h4>
                  <div className="space-y-3">
                    {selectedReport.sections.map((section, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(section.status)}`}>
                            {section.status === 'pass' ? <CheckCircle className="w-4 h-4" /> :
                             section.status === 'fail' ? <AlertTriangle className="w-4 h-4" /> :
                             <Clock className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{section.name}</p>
                            <p className="text-sm text-slate-600">{section.findings} findings</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${
                            section.score >= 80 ? 'text-green-600' :
                            section.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {section.score}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-slate-900 mb-4">Key Recommendations</h4>
                  <ul className="space-y-2">
                    {selectedReport.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <Target className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-slate-700">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};