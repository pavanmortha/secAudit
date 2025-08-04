import React, { useState } from 'react';
import { 
  Users as UsersIcon, 
  Plus, 
  Search, 
  Filter,
  MoreHorizontal,
  Edit3,
  Trash2,
  Shield,
  Mail,
  Phone
} from 'lucide-react';
import { User } from '../types';

export const Users: React.FC = () => {
  const [users] = useState<User[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@company.com',
      role: 'admin',
      department: 'IT Security',
      phone: '+1-555-0123',
      lastLogin: new Date('2024-01-20')
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane.smith@company.com',
      role: 'auditor',
      department: 'Security',
      phone: '+1-555-0124',
      lastLogin: new Date('2024-01-19')
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike.johnson@company.com',
      role: 'auditee',
      department: 'Development',
      phone: '+1-555-0125',
      lastLogin: new Date('2024-01-18')
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.department?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesFilter;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'auditor': return 'bg-blue-100 text-blue-800';
      case 'auditee': return 'bg-green-100 text-green-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return Shield;
      case 'auditor': return UsersIcon;
      case 'auditee': return UsersIcon;
      default: return UsersIcon;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-600">Manage system users and their permissions</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
          <Plus className="w-4 h-4" />
          <span>Add User</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="auditor">Auditor</option>
                <option value="auditee">Auditee</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredUsers.map((user) => {
          const RoleIcon = getRoleIcon(user.role);
          return (
            <div key={user.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <RoleIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{user.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </div>
                </div>
                <button className="p-1 hover:bg-slate-100 rounded">
                  <MoreHorizontal className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-600">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-600">{user.phone}</span>
                  </div>
                )}
                {user.department && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Department:</span>
                    <span className="text-sm font-medium text-slate-900">{user.department}</span>
                  </div>
                )}
                {user.lastLogin && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Last Login:</span>
                    <span className="text-sm font-medium text-slate-900">
                      {user.lastLogin.toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-slate-200">
                <button className="p-2 hover:bg-slate-100 rounded-lg">
                  <Edit3 className="w-4 h-4 text-slate-400" />
                </button>
                <button className="p-2 hover:bg-red-50 rounded-lg">
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <UsersIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">No users found matching your criteria</p>
        </div>
      )}
    </div>
  );
};