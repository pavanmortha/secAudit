import React, { useState } from 'react';
import { Audit } from '../../types';
import { LoadingSpinner } from '../Common/LoadingSpinner';

interface AuditFormProps {
  audit?: Audit;
  onSubmit: (audit: Partial<Audit>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const AuditForm: React.FC<AuditFormProps> = ({
  audit,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    title: audit?.title || '',
    type: audit?.type || 'vapt',
    scope: audit?.scope?.join(', ') || '',
    auditorId: audit?.auditorId || '',
    auditeeId: audit?.auditeeId || '',
    scheduledDate: audit?.scheduledDate ? new Date(audit.scheduledDate).toISOString().split('T')[0] : '',
    frequency: audit?.frequency || 'quarterly'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      scope: formData.scope.split(',').map(s => s.trim()).filter(s => s),
      scheduledDate: new Date(formData.scheduledDate),
      assetIds: audit?.assetIds || []
    };
    onSubmit(submitData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Audit Title *
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Audit Type *
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="vapt">VAPT (Vulnerability Assessment & Penetration Testing)</option>
            <option value="config_audit">Configuration Audit</option>
            <option value="red_team">Red Team Exercise</option>
            <option value="code_review">Code Review</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Frequency *
          </label>
          <select
            name="frequency"
            value={formData.frequency}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="quarterly">Quarterly</option>
            <option value="annually">Annually</option>
            <option value="one_time">One Time</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Scope (comma-separated) *
        </label>
        <textarea
          name="scope"
          value={formData.scope}
          onChange={handleChange}
          required
          rows={3}
          placeholder="Web Application, Network Infrastructure, Database Servers"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Auditor ID *
          </label>
          <input
            type="text"
            name="auditorId"
            value={formData.auditorId}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Auditee ID *
          </label>
          <input
            type="text"
            name="auditeeId"
            value={formData.auditeeId}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Scheduled Date *
        </label>
        <input
          type="date"
          name="scheduledDate"
          value={formData.scheduledDate}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
        >
          {isLoading && <LoadingSpinner size="sm" />}
          <span>{audit ? 'Update Audit' : 'Schedule Audit'}</span>
        </button>
      </div>
    </form>
  );
};