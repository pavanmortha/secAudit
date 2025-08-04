import React from 'react';
import { 
  Server, 
  Calendar, 
  Bug, 
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Shield
} from 'lucide-react';
import { MetricCard } from '../components/Dashboard/MetricCard';
import { VulnerabilityChart, ComplianceScoreChart } from '../components/Dashboard/ComplianceChart';
import { mockComplianceMetrics, mockVulnerabilities, mockAudits } from '../data/mockData';

export const Dashboard: React.FC = () => {
  const metrics = mockComplianceMetrics;
  const recentVulnerabilities = mockVulnerabilities.slice(0, 5);
  const upcomingAudits = mockAudits.filter(audit => 
    audit.status === 'scheduled' && new Date(audit.scheduledDate) > new Date()
  );

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Assets"
          value={metrics.totalAssets}
          icon={Server}
          trend="+5 this month"
          trendDirection="up"
          color="blue"
        />
        <MetricCard
          title="Active Audits"
          value={metrics.totalAudits}
          icon={Calendar}
          trend="2 scheduled"
          trendDirection="neutral"
          color="green"
        />
        <MetricCard
          title="Open Vulnerabilities"
          value={metrics.pendingVulnerabilities}
          icon={Bug}
          trend="-3 from last week"
          trendDirection="down"
          color="orange"
        />
        <MetricCard
          title="Critical Issues"
          value={metrics.criticalVulnerabilities}
          icon={AlertTriangle}
          trend="Needs attention"
          trendDirection="up"
          color="red"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <VulnerabilityChart />
        </div>
        <div>
          <ComplianceScoreChart />
        </div>
      </div>

      {/* Recent Activity & Upcoming Audits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Vulnerabilities */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Recent Vulnerabilities</h3>
            <Bug className="w-5 h-5 text-slate-400" />
          </div>
          <div className="space-y-3">
            {recentVulnerabilities.map((vuln) => (
              <div key={vuln.id} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                <div className={`w-3 h-3 rounded-full ${
                  vuln.severity === 'critical' ? 'bg-red-500' :
                  vuln.severity === 'high' ? 'bg-orange-500' :
                  vuln.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                }`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{vuln.title}</p>
                  <p className="text-xs text-slate-600">CVSS: {vuln.cvssScore}</p>
                </div>
                <div className={`px-2 py-1 text-xs rounded-full ${
                  vuln.status === 'open' ? 'bg-red-100 text-red-800' :
                  vuln.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {vuln.status.replace('_', ' ')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Audits */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Upcoming Audits</h3>
            <Calendar className="w-5 h-5 text-slate-400" />
          </div>
          <div className="space-y-3">
            {upcomingAudits.map((audit) => (
              <div key={audit.id} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{audit.title}</p>
                  <p className="text-xs text-slate-600">
                    {new Date(audit.scheduledDate).toLocaleDateString()} • {audit.type.toUpperCase()}
                  </p>
                </div>
                <div className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                  {audit.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Compliance Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Compliance Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">{metrics.auditCoverage}%</p>
            <p className="text-sm text-slate-600">Audit Coverage</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">{metrics.complianceScore}%</p>
            <p className="text-sm text-slate-600">Compliance Score</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-orange-600">{metrics.overdueTasks}</p>
            <p className="text-sm text-slate-600">Overdue Tasks</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-600">{metrics.criticalVulnerabilities}</p>
            <p className="text-sm text-slate-600">Critical Issues</p>
          </div>
        </div>
      </div>
    </div>
  );
};