import React from 'react';
import { AlertTriangle, Shield, Clock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface SecurityAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: Date;
  resolved: boolean;
}

const mockAlerts: SecurityAlert[] = [
  {
    id: '1',
    type: 'critical',
    title: 'Critical Vulnerability Detected',
    description: 'SQL injection vulnerability found in login system',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    resolved: false
  },
  {
    id: '2',
    type: 'warning',
    title: 'Audit Deadline Approaching',
    description: 'Q1 VAPT assessment due in 3 days',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    resolved: false
  },
  {
    id: '3',
    type: 'info',
    title: 'Security Scan Completed',
    description: 'Weekly vulnerability scan finished successfully',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    resolved: true
  }
];

export const SecurityAlerts: React.FC = () => {
  const getAlertIcon = (type: string, resolved: boolean) => {
    if (resolved) return CheckCircle;
    
    switch (type) {
      case 'critical': return AlertTriangle;
      case 'warning': return Clock;
      case 'info': return Shield;
      default: return AlertTriangle;
    }
  };

  const getAlertColor = (type: string, resolved: boolean) => {
    if (resolved) return 'text-green-600 bg-green-100';
    
    switch (type) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-orange-600 bg-orange-100';
      case 'info': return 'text-blue-600 bg-blue-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Security Alerts</h3>
        <span className="text-sm text-slate-600">
          {mockAlerts.filter(alert => !alert.resolved).length} active
        </span>
      </div>

      <div className="space-y-3">
        {mockAlerts.map((alert, index) => {
          const IconComponent = getAlertIcon(alert.type, alert.resolved);
          const colorClasses = getAlertColor(alert.type, alert.resolved);
          
          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-start space-x-3 p-3 rounded-lg ${
                alert.resolved ? 'bg-slate-50' : 'bg-white border border-slate-200'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${colorClasses}`}>
                <IconComponent className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${alert.resolved ? 'text-slate-600' : 'text-slate-900'}`}>
                  {alert.title}
                </p>
                <p className="text-xs text-slate-600 mt-1">{alert.description}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {alert.timestamp.toLocaleTimeString()}
                </p>
              </div>
              {!alert.resolved && (
                <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                  Resolve
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-200">
        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
          View all alerts
        </button>
      </div>
    </div>
  );
};