import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  Shield, 
  Eye,
  Zap,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';

interface SecurityEvent {
  id: string;
  type: 'intrusion_attempt' | 'malware_detected' | 'policy_violation' | 'system_anomaly' | 'data_breach';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  source: string;
  timestamp: Date;
  status: 'active' | 'investigating' | 'resolved' | 'false_positive';
  assignedTo?: string;
  affectedAssets: string[];
}

interface SystemMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  threshold: number;
  lastUpdated: Date;
}

const mockEvents: SecurityEvent[] = [
  {
    id: 'event-1',
    type: 'intrusion_attempt',
    severity: 'critical',
    title: 'Multiple Failed Login Attempts',
    description: 'Detected 50+ failed login attempts from IP 192.168.100.50 in the last 5 minutes',
    source: 'Web Application Firewall',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    status: 'active',
    assignedTo: 'SOC Analyst 1',
    affectedAssets: ['Web Server 1', 'Authentication Service']
  },
  {
    id: 'event-2',
    type: 'malware_detected',
    severity: 'high',
    title: 'Suspicious File Detected',
    description: 'Antivirus detected potential malware in email attachment on workstation WS-001',
    source: 'Endpoint Protection',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    status: 'investigating',
    assignedTo: 'Security Team',
    affectedAssets: ['Workstation WS-001']
  },
  {
    id: 'event-3',
    type: 'system_anomaly',
    severity: 'medium',
    title: 'Unusual Network Traffic',
    description: 'Detected abnormal outbound traffic patterns from database server',
    source: 'Network Monitoring',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    status: 'resolved',
    assignedTo: 'Network Admin',
    affectedAssets: ['Database Server 1']
  }
];

const mockMetrics: SystemMetric[] = [
  {
    id: 'cpu-usage',
    name: 'CPU Usage',
    value: 78,
    unit: '%',
    status: 'warning',
    trend: 'up',
    threshold: 80,
    lastUpdated: new Date()
  },
  {
    id: 'memory-usage',
    name: 'Memory Usage',
    value: 65,
    unit: '%',
    status: 'normal',
    trend: 'stable',
    threshold: 85,
    lastUpdated: new Date()
  },
  {
    id: 'disk-usage',
    name: 'Disk Usage',
    value: 45,
    unit: '%',
    status: 'normal',
    trend: 'up',
    threshold: 90,
    lastUpdated: new Date()
  },
  {
    id: 'network-traffic',
    name: 'Network Traffic',
    value: 234,
    unit: 'Mbps',
    status: 'normal',
    trend: 'down',
    threshold: 500,
    lastUpdated: new Date()
  },
  {
    id: 'failed-logins',
    name: 'Failed Logins',
    value: 12,
    unit: '/hour',
    status: 'warning',
    trend: 'up',
    threshold: 20,
    lastUpdated: new Date()
  },
  {
    id: 'active-sessions',
    name: 'Active Sessions',
    value: 156,
    unit: 'sessions',
    status: 'normal',
    trend: 'stable',
    threshold: 200,
    lastUpdated: new Date()
  }
];

export const RealTimeMonitoring: React.FC = () => {
  const [events, setEvents] = useState<SecurityEvent[]>(mockEvents);
  const [metrics, setMetrics] = useState<SystemMetric[]>(mockMetrics);
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(true);

  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      // Simulate real-time metric updates
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        value: Math.max(0, metric.value + (Math.random() - 0.5) * 10),
        lastUpdated: new Date(),
        trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable'
      })));

      // Occasionally add new events
      if (Math.random() > 0.8) {
        const newEvent: SecurityEvent = {
          id: `event-${Date.now()}`,
          type: 'system_anomaly',
          severity: 'low',
          title: 'System Health Check',
          description: 'Automated system health verification completed',
          source: 'System Monitor',
          timestamp: new Date(),
          status: 'active',
          affectedAssets: ['System Monitor']
        };
        setEvents(prev => [newEvent, ...prev.slice(0, 9)]);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isMonitoring]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'intrusion_attempt': return Shield;
      case 'malware_detected': return AlertTriangle;
      case 'policy_violation': return XCircle;
      case 'system_anomaly': return Activity;
      case 'data_breach': return AlertTriangle;
      default: return Eye;
    }
  };

  const getEventColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-slate-600 bg-slate-100 border-slate-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-800';
      case 'investigating': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'false_positive': return 'bg-slate-100 text-slate-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getMetricStatus = (metric: SystemMetric) => {
    if (metric.value >= metric.threshold * 0.9) return 'critical';
    if (metric.value >= metric.threshold * 0.7) return 'warning';
    return 'normal';
  };

  const getMetricColor = (status: string) => {
    switch (status) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'normal': return 'text-green-600 bg-green-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      case 'stable': return Minus;
      default: return Minus;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Real-Time Security Monitoring</h2>
          <p className="text-slate-600">Live security events and system metrics monitoring</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
            isMonitoring ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm font-medium">{isMonitoring ? 'Live' : 'Paused'}</span>
          </div>
          <button
            onClick={() => setIsMonitoring(!isMonitoring)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{isMonitoring ? 'Pause' : 'Resume'}</span>
          </button>
        </div>
      </div>

      {/* System Metrics */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">System Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {metrics.map((metric, index) => {
            const status = getMetricStatus(metric);
            const TrendIcon = getTrendIcon(metric.trend);
            
            return (
              <motion.div
                key={metric.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border ${getMetricColor(status)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium">{metric.name}</h4>
                  <TrendIcon className={`w-4 h-4 ${
                    metric.trend === 'up' ? 'text-red-500' :
                    metric.trend === 'down' ? 'text-green-500' : 'text-slate-500'
                  }`} />
                </div>
                <div className="text-2xl font-bold">
                  {metric.value.toFixed(0)}{metric.unit}
                </div>
                <div className="text-xs opacity-75">
                  Threshold: {metric.threshold}{metric.unit}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Security Events */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900">Live Security Events</h3>
          <div className="flex items-center space-x-2 text-sm text-slate-600">
            <Activity className="w-4 h-4" />
            <span>{events.filter(e => e.status === 'active').length} active events</span>
          </div>
        </div>
        
        <div className="space-y-3">
          {events.map((event, index) => {
            const EventIcon = getEventIcon(event.type);
            
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${getEventColor(event.severity)}`}
                onClick={() => setSelectedEvent(event)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getEventColor(event.severity)}`}>
                      <EventIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <h4 className="font-semibold text-slate-900">{event.title}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(event.status)}`}>
                          {event.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{event.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-slate-500">
                        <span>Source: {event.source}</span>
                        <span>Time: {event.timestamp.toLocaleTimeString()}</span>
                        {event.assignedTo && <span>Assigned: {event.assignedTo}</span>}
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      event.severity === 'critical' ? 'bg-red-100 text-red-800' :
                      event.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                      event.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {event.severity.toUpperCase()}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setSelectedEvent(null)}></div>
            
            <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Security Event Details</h3>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-slate-600">Event Type:</span>
                    <p className="font-medium text-slate-900 capitalize">{selectedEvent.type.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">Severity:</span>
                    <p className={`font-medium capitalize ${
                      selectedEvent.severity === 'critical' ? 'text-red-600' :
                      selectedEvent.severity === 'high' ? 'text-orange-600' :
                      selectedEvent.severity === 'medium' ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {selectedEvent.severity}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">Source:</span>
                    <p className="font-medium text-slate-900">{selectedEvent.source}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">Status:</span>
                    <p className="font-medium text-slate-900 capitalize">{selectedEvent.status.replace('_', ' ')}</p>
                  </div>
                </div>
                
                <div>
                  <span className="text-sm text-slate-600">Description:</span>
                  <p className="text-slate-900 mt-1">{selectedEvent.description}</p>
                </div>
                
                <div>
                  <span className="text-sm text-slate-600">Affected Assets:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedEvent.affectedAssets.map((asset, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                        {asset}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                  <button className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors">
                    Investigate
                  </button>
                  <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                    Mark Resolved
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};