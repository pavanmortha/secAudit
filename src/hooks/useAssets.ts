import { useState, useCallback } from 'react';
import { Asset } from '../types';
import { mockAssets } from '../data/mockData';

export const useAssets = () => {
  const [assets, setAssets] = useState<Asset[]>(mockAssets);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createAsset = useCallback(async (assetData: Partial<Asset>) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newAsset: Asset = {
        id: Date.now().toString(),
        name: assetData.name!,
        type: assetData.type!,
        ip: assetData.ip!,
        os: assetData.os!,
        version: assetData.version,
        criticality: assetData.criticality!,
        owner: assetData.owner!,
        department: assetData.department!,
        location: assetData.location,
        lastUpdated: new Date(),
        status: assetData.status!
      };
      
      setAssets(prev => [...prev, newAsset]);
      return newAsset;
    } catch (err) {
      setError('Failed to create asset');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAsset = useCallback(async (id: string, assetData: Partial<Asset>) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAssets(prev => prev.map(asset => 
        asset.id === id 
          ? { ...asset, ...assetData, lastUpdated: new Date() }
          : asset
      ));
    } catch (err) {
      setError('Failed to update asset');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteAsset = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAssets(prev => prev.filter(asset => asset.id !== id));
    } catch (err) {
      setError('Failed to delete asset');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    assets,
    loading,
    error,
    createAsset,
    updateAsset,
    deleteAsset
  };
};