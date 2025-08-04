import { useState, useCallback } from 'react';
import { Vulnerability } from '../types';
import { mockVulnerabilities } from '../data/mockData';

export const useVulnerabilities = () => {
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>(mockVulnerabilities);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createVulnerability = useCallback(async (vulnData: Partial<Vulnerability>) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newVulnerability: Vulnerability = {
        id: Date.now().toString(),
        auditId: vulnData.auditId!,
        assetId: vulnData.assetId!,
        title: vulnData.title!,
        description: vulnData.description!,
        severity: vulnData.severity!,
        cvssScore: vulnData.cvssScore!,
        epssScore: vulnData.epssScore,
        cveId: vulnData.cveId,
        category: vulnData.category!,
        status: vulnData.status!,
        assignedTo: vulnData.assignedTo,
        dueDate: vulnData.dueDate,
        rootCause: vulnData.rootCause,
        remediation: vulnData.remediation,
        discoveredDate: vulnData.discoveredDate || new Date()
      };
      
      setVulnerabilities(prev => [...prev, newVulnerability]);
      return newVulnerability;
    } catch (err) {
      setError('Failed to create vulnerability');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateVulnerability = useCallback(async (id: string, vulnData: Partial<Vulnerability>) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setVulnerabilities(prev => prev.map(vuln => 
        vuln.id === id 
          ? { ...vuln, ...vulnData }
          : vuln
      ));
    } catch (err) {
      setError('Failed to update vulnerability');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteVulnerability = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setVulnerabilities(prev => prev.filter(vuln => vuln.id !== id));
    } catch (err) {
      setError('Failed to delete vulnerability');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    vulnerabilities,
    loading,
    error,
    createVulnerability,
    updateVulnerability,
    deleteVulnerability
  };
};