import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Target,
  Shield,
  Zap,
  Activity,
  Settings,
  Download
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ScanResult {
  id: string;
  checkId: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: string;
  recommendation?: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  timestamp: Date;
}

interface AutomatedScan {
  id: string;
  name: string;
  description: string;
  category: string;
  isRunning: boolean;
  progress: number;
  stage: string;
  results: ScanResult[];
  lastRun?: Date;
  duration: string;
  automated: boolean;
}

export const AutomatedScanner: React.FC = () => {
  const [scans, setScans] = useState<AutomatedScan[]>([
    {
      id: 'network-scan',
      name: 'Network Security Scan',
      description: 'Automated network vulnerability assessment and configuration audit',
      category: 'Network Security',
      isRunning: false,
      progress: 0,
      stage: 'Ready',
      results: [],
      duration: '15-30 minutes',
      automated: true
    },
    {
      id: 'web-app-scan',
      name: 'Web Application Security Test',
      description: 'OWASP Top 10 and web application vulnerability assessment',
      category: 'Application Security',
      isRunning: false,
      progress: 0,
      stage: 'Ready',
      results: [],
      duration: '30-60 minutes',
      automated: true
    },
    {
      id: 'config-audit',
      name: 'System Configuration Audit',
      description: 'Operating system and service configuration compliance check',
      category: 'System Security',
      isRunning: false,
      progress: 0,
      stage: 'Ready',
      results: [],
      duration: '20-40 minutes',
      automated: true
    },
    {
      id: 'access-review',
      name: 'Access Control Assessment',
      description: 'User access rights and privilege escalation vulnerability check',
      category: 'Access Control',
      isRunning: false,
      progress: 0,
      stage: 'Ready',
      results: [],
      duration: '10-20 minutes',
      automated: true
    }
  ]);

  const [selectedScan, setSelectedScan] = useState<AutomatedScan | null>(null);

  const startScan = (scanId: string) => {
    setScans(prev => prev.map(scan => 
      scan.id === scanId 
        ? { ...scan, isRunning: true, progress: 0, stage: 'Initializing...', results: [] }
        : scan
    ));

    // Simulate scan progress
    const stages = [
      'Initializing scan...',
      'Discovering targets...',
      'Running security tests...',
      'Analyzing results...',
      'Generating findings...',
      'Scan completed'
    ];

    let progress = 0;
    let stageIndex = 0;
    
    const interval = setInterval(() => {
      progress += Math.random() * 10 + 5;
      if (progress > 100) progress = 100;
      
      const newStageIndex = Math.floor((progress / 100) * (stages.length - 1));
      if (newStageIndex !== stageIndex) {
        stageIndex = newStageIndex;
      }

      setScans(prev => prev.map(scan => 
        scan.id === scanId 
          ? { 
              ...scan, 
              progress, 
              stage: stages[stageIndex],
              results: progress > 50 ? generateMockResults(scanId) : []
            }
          : scan
      ));

      if (progress >= 100) {
        clearInterval(interval);
        setScans(prev => prev.map(scan => 
          scan.id === scanId 
            ? { 
                ...scan, 
                isRunning: false, 
                lastRun: new Date(),
                results: generateMockResults(scanId)
              }
            : scan
        ));
      }
    }, 1000);
  };

  const stopScan = (scanId: string) => {
    setScans(prev => prev.map(scan => 
      scan.id === scanId 
        ? { ...scan, isRunning: false, stage: 'Stopped' }
        : scan
    ));
  };

  const generateMockResults = (scanId: string): ScanResult[] => {
    const baseResults = [
      {
        id: `${scanId}-1`,
        checkId: 'ssl-config',
        status: 'fail' as const,
        message: 'Weak SSL/TLS Configuration',
        details: 'Server supports deprecated TLS 1.0 and weak cipher suites',
        recommendation: 'Disable TLS 1.0/1.1 and implement strong cipher suites',
        severity: 'medium' as const,
        timestamp: new Date()
      },
      {
        id: `${scanId}-2`,
        checkId: 'firewall-rules',
        status: 'pass' as const,
        message: 'Firewall Configuration Compliant',
        details: 'Firewall rules properly configured with default deny policy',
        severity: 'low' as const,
        timestamp: new Date()
      },
      {
        id: `${scanId}-3`,
        checkId: 'patch-mgmt',
        status: 'warning' as const,
        message: 'Outdated System Components',
        details: 'Several system components are missing security patches',
        recommendation: 'Implement automated patch management system',
        severity: 'high' as const,
        timestamp: new Date()
      }
    ];

    if (scanId === 'web-app-scan') {
      return [
        ...baseResults,
        {
          id: `${scanId}-4`,
          checkId: 'sql-injection',
          status: 'fail',
          message: 'SQL Injection Vulnerability',
          details: 'Login form vulnerable to SQL injection attacks',
          recommendation: 'Implement parameterized queries and input validation',
          severity: 'critical',
          timestamp: new Date()
        }
      ];
    }

    return baseResults;
  };

  const getResultIcon = (status: string) => {
    switch (status) {
      case 'pass': return CheckCircle;
      case 'fail': return AlertTriangle;
      case 'warning': return Clock;
      default: return Shield;
    }
  };

  const getResultColor = (status: string) => {
    switch (status) {
      case 'pass': return 'text-green-600 bg-green-100';
      case 'fail': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-500 text-red-700';
      case 'high': return 'border-orange-500 text-orange-700';
      case 'medium': return 'border-yellow-500 text-yellow-700';
      case 'low': return 'border-green-500 text-green-700';
      default: return 'border-slate-500 text-slate-700';
    }
  };

  const runAllScans = () => {
    scans.forEach(scan => {
      if (!scan.isRunning) {
        setTimeout(() => startScan(scan.id), Math.random() * 2000);
      }
    });
  };

  const totalResults = scans.reduce((acc, scan) => acc + scan.results.length, 0);
  const failedResults = scans.reduce((acc, scan) => 
    acc + scan.results.filter(r => r.status === 'fail').length, 0
  );
  const passedResults = scans.reduce((acc, scan) => 
    acc + scan.results.filter(r => r.status === 'pass').length, 0
  );

  return (
    <div className="space-y-6">
      {/* Scanner Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Scans</p>
              <p className="text-2xl font-bold text-slate-900">{scans.length}</p>
            </div>
            <Target className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Running</p>
              <p className="text-2xl font-bold text-blue-600">
                {scans.filter(s => s.isRunning).length}
              </p>
            </div>
            <Activity className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Passed</p>
              <p className="text-2xl font-bold text-green-600">{passedResults}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Failed</p>
              <p className="text-2xl font-bold text-red-600">{failedResults}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Automated Security Scans</h3>
          <div className="flex items-center space-x-3">
            <button
              onClick={runAllScans}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Zap className="w-4 h-4" />
              <span>Run All Scans</span>
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
              <Download className="w-4 h-4" />
              <span>Export Results</span>
            </button>
          </div>
        </div>
      </div>

      {/* Scan Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {scans.map((scan, index) => (
          <motion.div
            key={scan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{scan.name}</h3>
                  <p className="text-sm text-slate-600">{scan.category}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {scan.isRunning ? (
                  <button
                    onClick={() => stopScan(scan.id)}
                    className="flex items-center space-x-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
                  >
                    <Pause className="w-3 h-3" />
                    <span>Stop</span>
                  </button>
                ) : (
                  <button
                    onClick={() => startScan(scan.id)}
                    className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                  >
                    <Play className="w-3 h-3" />
                    <span>Start</span>
                  </button>
                )}
                
                <button
                  onClick={() => setSelectedScan(scan)}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-4">{scan.description}</p>

            {scan.isRunning && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-slate-600">Progress</span>
                  <span className="font-semibold text-slate-900">{scan.progress}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                  <motion.div
                    className="h-2 bg-blue-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${scan.progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-sm text-slate-600">{scan.stage}</p>
              </div>
            )}

            {scan.results.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-slate-900 mb-2">Latest Results</h4>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-green-50 rounded">
                    <div className="text-sm font-bold text-green-600">
                      {scan.results.filter(r => r.status === 'pass').length}
                    </div>
                    <div className="text-xs text-green-600">Passed</div>
                  </div>
                  <div className="p-2 bg-yellow-50 rounded">
                    <div className="text-sm font-bold text-yellow-600">
                      {scan.results.filter(r => r.status === 'warning').length}
                    </div>
                    <div className="text-xs text-yellow-600">Warnings</div>
                  </div>
                  <div className="p-2 bg-red-50 rounded">
                    <div className="text-sm font-bold text-red-600">
                      {scan.results.filter(r => r.status === 'fail').length}
                    </div>
                    <div className="text-xs text-red-600">Failed</div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>Duration: {scan.duration}</span>
              {scan.lastRun && (
                <span>Last run: {scan.lastRun.toLocaleTimeString()}</span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Detailed Results */}
      {scans.some(scan => scan.results.length > 0) && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Scan Results</h3>
          
          <div className="space-y-4">
            {scans.filter(scan => scan.results.length > 0).map(scan => (
              <div key={scan.id} className="border border-slate-200 rounded-lg p-4">
                <h4 className="font-medium text-slate-900 mb-3">{scan.name}</h4>
                <div className="space-y-2">
                  {scan.results.map(result => {
                    const ResultIcon = getResultIcon(result.status);
                    return (
                      <div
                        key={result.id}
                        className={`flex items-start space-x-3 p-3 border-l-4 rounded ${getSeverityColor(result.severity)} bg-white`}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getResultColor(result.status)}`}>
                          <ResultIcon className="w-3 h-3" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{result.message}</p>
                          {result.details && (
                            <p className="text-sm text-slate-600 mt-1">{result.details}</p>
                          )}
                          {result.recommendation && (
                            <p className="text-sm text-blue-700 mt-2">
                              <strong>Recommendation:</strong> {result.recommendation}
                            </p>
                          )}
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          result.severity === 'critical' ? 'bg-red-100 text-red-800' :
                          result.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                          result.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {result.severity}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scan Configuration Modal */}
      {selectedScan && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setSelectedScan(null)}></div>
            
            <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Configure {selectedScan.name}</h3>
                <button
                  onClick={() => setSelectedScan(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Scan Targets</label>
                  <textarea
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Enter IP ranges, domains, or specific targets..."
                    defaultValue="192.168.1.0/24"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Scan Intensity</label>
                    <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option>Light (Fast)</option>
                      <option>Normal (Balanced)</option>
                      <option>Intensive (Thorough)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Report Format</label>
                    <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option>PDF Report</option>
                      <option>HTML Report</option>
                      <option>JSON Data</option>
                      <option>XML Export</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Scan Options</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                      <span className="ml-2 text-sm text-slate-700">Include port scanning</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                      <span className="ml-2 text-sm text-slate-700">Service version detection</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                      <span className="ml-2 text-slate-700">Aggressive scanning (may be detected)</span>
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setSelectedScan(null)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      startScan(selectedScan.id);
                      setSelectedScan(null);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Start Scan
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