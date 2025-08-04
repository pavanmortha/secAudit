import { useState, useCallback } from 'react';
import { Audit } from '../types';
import { mockAudits } from '../data/mockData';

export const useAudits = () => {
  const [audits, setAudits] = useState<Audit[]>(mockAudits);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createAudit = useCallback(async (auditData: Partial<Audit>) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newAudit: Audit = {
        id: Date.now().toString(),
        title: auditData.title!,
        type: auditData.type!,
        scope: auditData.scope!,
        assetIds: auditData.assetIds || [],
        auditorId: auditData.auditorId!,
        auditeeId: auditData.auditeeId!,
        status: 'scheduled',
        scheduledDate: auditData.scheduledDate!,
        frequency: auditData.frequency!,
        documents: []
      };
      
      setAudits(prev => [...prev, newAudit]);
      return newAudit;
    } catch (err) {
      setError('Failed to create audit');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAudit = useCallback(async (id: string, auditData: Partial<Audit>) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAudits(prev => prev.map(audit => 
        audit.id === id 
          ? { ...audit, ...auditData }
          : audit
      ));
    } catch (err) {
      setError('Failed to update audit');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteAudit = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAudits(prev => prev.filter(audit => audit.id !== id));
    } catch (err) {
      setError('Failed to delete audit');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    audits,
    loading,
    error,
    createAudit,
    updateAudit,
    deleteAudit
  };
};