import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../../services/api';

const COLORS = ['#dc2626', '#ea580c', '#d97706', '#65a30d', '#059669'];

export const VulnerabilityTrendChart: React.FC = () => {
  const { data: chartData } = useQuery({
    queryKey: ['vulnerability-trend'],
    queryFn: () => dashboardApi.getChartData().then(res => res.data.vulnerabilityTrend),
    refetchInterval: 60000, // Refresh every minute
  });

  if (!chartData) return <div className="h-64 bg-slate-100 animate-pulse rounded-lg" />;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Vulnerability Trend (Last 30 Days)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="critical"
            stackId="1"
            stroke="#dc2626"
            fill="#dc2626"
            fillOpacity={0.8}
          />
          <Area
            type="monotone"
            dataKey="high"
            stackId="1"
            stroke="#ea580c"
            fill="#ea580c"
            fillOpacity={0.8}
          />
          <Area
            type="monotone"
            dataKey="medium"
            stackId="1"
            stroke="#d97706"
            fill="#d97706"
            fillOpacity={0.8}
          />
          <Area
            type="monotone"
            dataKey="low"
            stackId="1"
            stroke="#65a30d"
            fill="#65a30d"
            fillOpacity={0.8}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const ComplianceScoreChart: React.FC = () => {
  const { data: chartData } = useQuery({
    queryKey: ['compliance-score'],
    queryFn: () => dashboardApi.getChartData().then(res => res.data.complianceScore),
    refetchInterval: 60000,
  });

  if (!chartData) return <div className="h-64 bg-slate-100 animate-pulse rounded-lg" />;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Compliance Score Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[0, 100]} />
          <Tooltip formatter={(value) => [`${value}%`, 'Compliance Score']} />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#059669"
            strokeWidth={3}
            dot={{ fill: '#059669', strokeWidth: 2, r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export const AssetDistributionChart: React.FC = () => {
  const { data: chartData } = useQuery({
    queryKey: ['asset-distribution'],
    queryFn: () => dashboardApi.getChartData().then(res => res.data.assetDistribution),
    refetchInterval: 60000,
  });

  if (!chartData) return <div className="h-64 bg-slate-100 animate-pulse rounded-lg" />;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Asset Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry: any, index: number) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export const AuditProgressChart: React.FC = () => {
  const { data: chartData } = useQuery({
    queryKey: ['audit-progress'],
    queryFn: () => dashboardApi.getChartData().then(res => res.data.auditProgress),
    refetchInterval: 60000,
  });

  if (!chartData) return <div className="h-64 bg-slate-100 animate-pulse rounded-lg" />;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Audit Progress</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="completed" fill="#059669" name="Completed" />
          <Bar dataKey="inProgress" fill="#d97706" name="In Progress" />
          <Bar dataKey="scheduled" fill="#6b7280" name="Scheduled" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};