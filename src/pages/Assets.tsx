import React, { useState } from 'react';
import { 
  Server, 
  Plus, 
  Search, 
  Filter,
  MoreHorizontal,
  Edit3,
  Trash2,
  Globe,
  Database,
  Monitor
} from 'lucide-react';
import { Modal } from '../components/Common/Modal';
import { AssetForm } from '../components/Forms/AssetForm';
import { useAssets } from '../hooks/useAssets';
import { Asset } from '../types';

export const Assets: React.FC = () => {
  const { assets, loading, createAsset, updateAsset, deleteAsset } = useAssets();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.ip.includes(searchTerm) ||
                         asset.owner.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || asset.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'web_app': return Globe;
      case 'database': return Database;
      case 'server': return Server;
      case 'endpoint': return Monitor;
      default: return Server;
    }
  };

  const getCriticalityColor = (criticality: string) => {
    switch (criticality) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const handleCreateAsset = async (assetData: Partial<Asset>) => {
    try {
      await createAsset(assetData);
      setShowModal(false);
    } catch (error) {
      console.error('Failed to create asset:', error);
    }
  };

  const handleUpdateAsset = async (assetData: Partial<Asset>) => {
    if (!editingAsset) return;
    
    try {
      await updateAsset(editingAsset.id, assetData);
      setEditingAsset(null);
      setShowModal(false);
    } catch (error) {
      console.error('Failed to update asset:', error);
    }
  };

  const handleDeleteAsset = async (id: string) => {
    try {
      await deleteAsset(id);
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete asset:', error);
    }
  };

  const openCreateModal = () => {
    setEditingAsset(null);
    setShowModal(true);
  };

  const openEditModal = (asset: Asset) => {
    setEditingAsset(asset);
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Asset Management</h1>
          <p className="text-slate-600">Manage and monitor your digital assets</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Asset</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="web_app">Web Applications</option>
                <option value="server">Servers</option>
                <option value="database">Databases</option>
                <option value="endpoint">Endpoints</option>
                <option value="network_device">Network Devices</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredAssets.map((asset) => {
          const IconComponent = getAssetIcon(asset.type);
          return (
            <div key={asset.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <IconComponent className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{asset.name}</h3>
                    <p className="text-sm text-slate-600">{asset.ip}</p>
                  </div>
                </div>
                <button className="p-1 hover:bg-slate-100 rounded">
                  <MoreHorizontal className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">OS:</span>
                  <span className="text-sm font-medium text-slate-900">{asset.os}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Owner:</span>
                  <span className="text-sm font-medium text-slate-900">{asset.owner}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Department:</span>
                  <span className="text-sm font-medium text-slate-900">{asset.department}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
                <div className="flex space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${getCriticalityColor(asset.criticality)}`}>
                    {asset.criticality}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(asset.status)}`}>
                    {asset.status}
                  </span>
                </div>
                <div className="flex space-x-1">
                  <button 
                    onClick={() => openEditModal(asset)}
                    className="p-2 hover:bg-slate-100 rounded-lg"
                  >
                    <Edit3 className="w-4 h-4 text-slate-400" />
                  </button>
                  <button 
                    onClick={() => setShowDeleteConfirm(asset.id)}
                    className="p-2 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredAssets.length === 0 && (
        <div className="text-center py-12">
          <Server className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">No assets found matching your criteria</p>
        </div>
      )}

      {/* Asset Form Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingAsset(null);
        }}
        title={editingAsset ? 'Edit Asset' : 'Add New Asset'}
        size="lg"
      >
        <AssetForm
          asset={editingAsset || undefined}
          onSubmit={editingAsset ? handleUpdateAsset : handleCreateAsset}
          onCancel={() => {
            setShowModal(false);
            setEditingAsset(null);
          }}
          isLoading={loading}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        title="Delete Asset"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this asset? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowDeleteConfirm(null)}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => showDeleteConfirm && handleDeleteAsset(showDeleteConfirm)}
              disabled={loading}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};