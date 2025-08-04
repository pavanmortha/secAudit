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
import { 
  VulnerabilityTrendChart, 
  ComplianceScoreChart, 
  AssetDistributionChart,
  AuditProgressChart 
} from '../components/Dashboard/RealTimeCharts';
import { RecentActivity } from '../components/Dashboard/RecentActivity';
import { VulnerabilityHeatmap } from '../components/Vulnerabilities/VulnerabilityHeatmap';
import { useRealTimeMetrics, useRealTimeVulnerabilities, useRealTimeAssets, useRealTimeAudits } from '../hooks/useRealTimeData';

export const Dashboard: React.FC = () => {
  const { metrics, isLoading } = useRealTimeMetrics();
  
  // Initialize real-time hooks
  useRealTimeVulnerabilities();
  useRealTimeAssets();
  useRealTimeAudits();

  if (isLoading || !metrics) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-slate-100 animate-pulse rounded-xl" />
          <div className="h-80 bg-slate-100 animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

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
          <VulnerabilityTrendChart />
        </div>
        <div>
          <ComplianceScoreChart />
        </div>
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AssetDistributionChart />
        <AuditProgressChart />
      </div>

      {/* Vulnerability Heatmap */}
      <VulnerabilityHeatmap />

      {/* Recent Activity & Upcoming Audits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <RecentActivity />


        {/* Compliance Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Compliance Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
    </div>
  );
};