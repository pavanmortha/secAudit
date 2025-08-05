import React from 'react';
import { Clock, CheckCircle, AlertTriangle, User } from 'lucide-react';
import { format } from 'date-fns';
import { useRealTimeActivity } from '../../hooks/useRealTimeData';

export const RecentActivity: React.FC = () => {
  const { activities, isLoading } = useRealTimeActivity();

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-slate-200 rounded-full animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded animate-pulse" />
                <div className="h-3 bg-slate-200 rounded animate-pulse w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'complete':
        return CheckCircle;
      case 'create':
        return AlertTriangle;
      case 'update':
        return CheckCircle;
      case 'scan':
        return User;
      default:
        return Clock;
    }
  };

  const getActivityColor = (type: string, severity?: string) => {
    if (type === 'create' && severity) {
      switch (severity) {
        case 'critical': return 'text-red-600 bg-red-100';
        case 'high': return 'text-orange-600 bg-orange-100';
        case 'medium': return 'text-yellow-600 bg-yellow-100';
        default: return 'text-blue-600 bg-blue-100';
      }
    }
    
    switch (type) {
      case 'complete':
      case 'update':
        return 'text-green-600 bg-green-100';
      case 'create':
      case 'scan':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-slate-600 bg-slate-100';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.slice(0, 6).map((activity) => {
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
                  <span>{format(new Date(activity.timestamp), 'MMM dd, HH:mm')}</span>
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