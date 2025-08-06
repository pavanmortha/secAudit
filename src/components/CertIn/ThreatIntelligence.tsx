import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  AlertTriangle, 
  Shield, 
  Target,
  TrendingUp,
  Clock,
  ExternalLink,
  Download,
  Filter,
  Search,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ThreatFeed {
  id: string;
  source: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  indicators: string[];
  timestamp: Date;
  affectedSystems: string[];
  mitigations: string[];
  references: string[];
}

interface ThreatIndicator {
  id: string;
  type: 'ip' | 'domain' | 'hash' | 'url';
  value: string;
  confidence: number;
  source: string;
  firstSeen: Date;
  lastSeen: Date;
  tags: string[];
}

const mockThreatFeeds: ThreatFeed[] = [
  {
    id: 'threat-1',
    source: 'CERT-In',
    title: 'Critical Vulnerability in Apache HTTP Server',
    description: 'Remote code execution vulnerability affecting Apache HTTP Server versions 2.4.49 and 2.4.50',
    severity: 'critical',
    category: 'Software Vulnerability',
    indicators: ['CVE-2021-41773', 'Apache HTTP Server'],
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    affectedSystems: ['Web Servers', 'Reverse Proxies'],
    mitigations: ['Update to Apache 2.4.51+', 'Apply security patches', 'Monitor for exploitation'],
    references: ['https://httpd.apache.org/security/vulnerabilities_24.html']
  },
  {
    id: 'threat-2',
    source: 'NCIIPC',
    title: 'Ransomware Campaign Targeting Healthcare',
    description: 'New ransomware variant specifically targeting healthcare infrastructure in India',
    severity: 'high',
    category: 'Malware',
    indicators: ['Conti Ransomware', 'Healthcare Sector'],
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    affectedSystems: ['Windows Systems', 'Medical Devices', 'Patient Records'],
    mitigations: ['Backup verification', 'Network segmentation', 'User training'],
    references: ['https://www.nciipc.gov.in/alerts']
  },
  {
    id: 'threat-3',
    source: 'CISA',
    title: 'Supply Chain Attack on Software Libraries',
    description: 'Malicious packages discovered in popular JavaScript libraries affecting web applications',
    severity: 'high',
    category: 'Supply Chain',
    indicators: ['npm packages', 'JavaScript libraries'],
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    affectedSystems: ['Web Applications', 'Node.js Applications'],
    mitigations: ['Dependency scanning', 'Package verification', 'Code review'],
    references: ['https://www.cisa.gov/alerts']
  }
];

const mockIndicators: ThreatIndicator[] = [
  {
    id: 'ioc-1',
    type: 'ip',
    value: '192.168.100.50',
    confidence: 95,
    source: 'CERT-In',
    firstSeen: new Date(Date.now() - 24 * 60 * 60 * 1000),
    lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000),
    tags: ['malware', 'c2', 'botnet']
  },
  {
    id: 'ioc-2',
    type: 'domain',
    value: 'malicious-domain.com',
    confidence: 88,
    source: 'Threat Intelligence',
    firstSeen: new Date(Date.now() - 48 * 60 * 60 * 1000),
    lastSeen: new Date(Date.now() - 1 * 60 * 60 * 1000),
    tags: ['phishing', 'credential-theft']
  },
  {
    id: 'ioc-3',
    type: 'hash',
    value: 'a1b2c3d4e5f6789012345678901234567890abcd',
    confidence: 92,
    source: 'VirusTotal',
    firstSeen: new Date(Date.now() - 12 * 60 * 60 * 1000),
    lastSeen: new Date(Date.now() - 30 * 60 * 1000),
    tags: ['ransomware', 'encryption']
  }
];

export const ThreatIntelligence: React.FC = () => {
  const [activeTab, setActiveTab] = useState('feeds');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const tabs = [
    { id: 'feeds', name: 'Threat Feeds', icon: Globe },
    { id: 'indicators', name: 'IOCs', icon: Target },
    { id: 'analysis', name: 'Analysis', icon: TrendingUp }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-slate-600 bg-slate-100 border-slate-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ip': return 'bg-blue-100 text-blue-800';
      case 'domain': return 'bg-purple-100 text-purple-800';
      case 'hash': return 'bg-green-100 text-green-800';
      case 'url': return 'bg-orange-100 text-orange-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const refreshFeeds = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  const filteredFeeds = mockThreatFeeds.filter(feed => {
    const matchesSearch = feed.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feed.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = filterSeverity === 'all' || feed.severity === filterSeverity;
    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Threat Intelligence</h2>
          <p className="text-slate-600">Real-time threat feeds and indicators of compromise</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={refreshFeeds}
            disabled={isRefreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
            <Download className="w-4 h-4" />
            <span>Export IOCs</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search threats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'feeds' && (
        <div className="space-y-4">
          {filteredFeeds.map((feed, index) => (
            <motion.div
              key={feed.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white rounded-xl shadow-sm border-l-4 p-6 ${getSeverityColor(feed.severity)}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-slate-900">{feed.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(feed.severity)}`}>
                      {feed.severity.toUpperCase()}
                    </span>
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                      {feed.source}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">{feed.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="text-sm font-medium text-slate-900 mb-2">Affected Systems</h4>
                      <div className="flex flex-wrap gap-1">
                        {feed.affectedSystems.map((system, idx) => (
                          <span key={idx} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                            {system}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-900 mb-2">Mitigations</h4>
                      <ul className="text-xs text-slate-600 space-y-1">
                        {feed.mitigations.slice(0, 3).map((mitigation, idx) => (
                          <li key={idx}>• {mitigation}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="ml-4 text-right">
                  <Clock className="w-4 h-4 text-slate-400 inline mr-1" />
                  <span className="text-xs text-slate-500">
                    {feed.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <div className="flex items-center space-x-4 text-sm text-slate-600">
                  <span>Category: {feed.category}</span>
                  <span>Indicators: {feed.indicators.length}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors">
                    <ExternalLink className="w-3 h-3" />
                    <span>View Details</span>
                  </button>
                  <button className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors">
                    <Shield className="w-3 h-3" />
                    <span>Apply Mitigations</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === 'indicators' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Indicators of Compromise (IOCs)</h3>
            <div className="space-y-4">
              {mockIndicators.map((indicator, index) => (
                <motion.div
                  key={indicator.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  <div className="flex items-center space-x-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(indicator.type)}`}>
                      {indicator.type.toUpperCase()}
                    </span>
                    <div>
                      <p className="font-mono text-sm text-slate-900">{indicator.value}</p>
                      <p className="text-xs text-slate-600">
                        Confidence: {indicator.confidence}% • Source: {indicator.source}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right text-xs text-slate-500">
                      <p>First: {indicator.firstSeen.toLocaleDateString()}</p>
                      <p>Last: {indicator.lastSeen.toLocaleDateString()}</p>
                    </div>
                    <button className="p-2 hover:bg-slate-100 rounded-lg">
                      <ExternalLink className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analysis' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Threat Landscape</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="font-medium text-red-900">Critical Threats</p>
                  <p className="text-sm text-red-700">Active campaigns targeting your sector</p>
                </div>
                <div className="text-2xl font-bold text-red-600">3</div>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div>
                  <p className="font-medium text-orange-900">Emerging Threats</p>
                  <p className="text-sm text-orange-700">New vulnerabilities discovered</p>
                </div>
                <div className="text-2xl font-bold text-orange-600">7</div>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-blue-900">IOCs Detected</p>
                  <p className="text-sm text-blue-700">Indicators found in your environment</p>
                </div>
                <div className="text-2xl font-bold text-blue-600">12</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Threat Categories</h3>
            <div className="space-y-3">
              {[
                { name: 'Malware', count: 15, trend: 'up' },
                { name: 'Phishing', count: 8, trend: 'down' },
                { name: 'Ransomware', count: 5, trend: 'up' },
                { name: 'APT', count: 3, trend: 'stable' },
                { name: 'Supply Chain', count: 2, trend: 'up' }
              ].map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">{category.name}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-slate-900">{category.count}</span>
                    <TrendingUp className={`w-4 h-4 ${
                      category.trend === 'up' ? 'text-red-500' :
                      category.trend === 'down' ? 'text-green-500' : 'text-slate-400'
                    }`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};