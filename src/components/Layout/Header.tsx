import React from 'react';
import { User, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { RealTimeIndicator } from '../Common/RealTimeIndicator';
import { NotificationCenter } from '../Common/NotificationCenter';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Cybersecurity Audit Dashboard</h1>
          <div className="flex items-center space-x-4">
            <p className="text-sm text-slate-600">CERT-In Compliant Security Assessment Platform</p>
            <RealTimeIndicator />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <NotificationCenter />
          
          <div className="flex items-center space-x-3 pl-4 border-l border-slate-200">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900">{user?.name}</p>
              <p className="text-xs text-slate-600 capitalize">{user?.role}</p>
            </div>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <button
              onClick={logout}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};