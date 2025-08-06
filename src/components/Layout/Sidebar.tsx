import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Shield, 
  Server, 
  Calendar, 
  Bug, 
  FileText, 
  BarChart3, 
  Users,
  Settings,
  AlertTriangle,
  Target
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: BarChart3 },
  { name: 'Assets', href: '/assets', icon: Server },
  { name: 'Audits', href: '/audits', icon: Calendar },
  { name: 'Vulnerabilities', href: '/vulnerabilities', icon: Bug },
  { name: 'CERT-In Tools', href: '/certin-audit', icon: Target },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  return (
    <div className="flex flex-col w-64 bg-slate-900 border-r border-slate-700">
      <div className="flex items-center justify-center h-16 px-4 bg-slate-800 border-b border-slate-700">
        <Shield className="w-8 h-8 text-blue-400 mr-3" />
        <span className="text-xl font-bold text-white">SecAudit Pro</span>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.name}
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center p-3 bg-orange-900/20 border border-orange-600/30 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-orange-400 mr-3" />
          <div>
            <p className="text-sm font-medium text-orange-300">Security Alert</p>
            <p className="text-xs text-orange-400">3 critical issues</p>
          </div>
        </div>
      </div>
    </div>
  );
};