import React from 'react';
import { Clock, CheckCircle, AlertTriangle, User } from 'lucide-react';
import { format } from 'date-fns';

interface ActivityItem {
  id: string;
  type: 'audit_completed' | 'vulnerability_found' | 'vulnerability_resolved' | 'asset_added';
  title: string;
  description: string;
  timestamp: Date;
  user: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'vulnerability_found',
    title: 'Critical SQL Injection Found',
    description: 'New critical vulnerability discovered in login form',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    user: 'Security Scanner',
    severity: 'critical'
  },
  {
    id: '2',
    type: 'audit_completed',
    title: 'VAPT Assessment Completed',
    description: 'Q1 2024 vulnerability assessment has been completed',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    user: 'John Auditor'
  },
  {
    id: '3',
    type: 'vulnerability_resolved',
    title: 'XSS Vulnerability Resolved',
    description: 'Cross-site scripting issue in user profile has been fixed',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    user: 'Dev Team',
    severity: 'medium'
  },
  {
    id: '4',
    type: 'asset_added',
    title: 'New Server Added',
    description: 'Production web server added to asset inventory',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    user: 'IT Admin'
  }
];

export const RecentActivity: React.FC = () => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'audit_completed':
        return CheckCircle;
      case 'vulnerability_found':
        return AlertTriangle;
      case 'vulnerability_resolved':
        return CheckCircle;
      case 'asset_added':
        return User;
      default:
        return Clock;
    }
  };

  const getActivityColor = (type: string, severity?: string) => {
    if (type === 'vulnerability_found') {
      switch (severity) {
        case 'critical': return 'text-red-600 bg-red-100';
        case 'high': return 'text-orange-600 bg-orange-100';
        case 'medium': return 'text-yellow-600 bg-yellow-100';
        default: return 'text-blue-600 bg-blue-100';
      }
    }
    
    switch (type) {
      case 'audit_completed':
      case 'vulnerability_resolved':
        return 'text-green-600 bg-green-100';
      case 'asset_added':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-slate-600 bg-slate-100';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {mockActivities.map((activity) => {
          const IconComponent = getActivityIcon(activity.type);
          const colorClasses = getActivityColor(activity.type, activity.severity);
          
          return (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${colorClasses}`}>
                <IconComponent className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900">{activity.title}</p>
                <p className="text-xs text-slate-600 mb-1">{activity.description}</p>
                <div className="flex items-center space-x-2 text-xs text-slate-500">
                  <span>{format(activity.timestamp, 'MMM dd, HH:mm')}</span>
                  <span>•</span>
                  <span>{activity.user}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 pt-4 border-t border-slate-200">
        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
          View all activity
        </button>
      </div>
    </div>
  );
};