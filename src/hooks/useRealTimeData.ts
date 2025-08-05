import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import websocketService from '../services/websocket';
import { dashboardApi } from '../services/api';
import toast from 'react-hot-toast';

export const useRealTimeMetrics = () => {
  const queryClient = useQueryClient();
  
  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: () => dashboardApi.getMetrics().then(res => res.data),
    refetchInterval: 30000, // Fallback polling every 30 seconds
  });

  useEffect(() => {
    const socket = websocketService.connect();
    
    websocketService.onMetricsUpdate((updatedMetrics) => {
      queryClient.setQueryData(['dashboard-metrics'], updatedMetrics);
    });

    return () => {
      websocketService.off('metrics:updated');
    };
  }, [queryClient]);

  return { metrics, isLoading, error };
};

export const useRealTimeActivity = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const queryClient = useQueryClient();

  const { data: initialActivities, isLoading } = useQuery({
    queryKey: ['dashboard-activity'],
    queryFn: () => dashboardApi.getActivity().then(res => res.data),
  });

  useEffect(() => {
    if (initialActivities) {
      setActivities(initialActivities);
    }
  }, [initialActivities]);

  useEffect(() => {
    const socket = websocketService.connect();
    
    websocketService.onNewActivity((newActivity) => {
      setActivities(prev => [newActivity, ...prev.slice(0, 9)]); // Keep last 10 activities
      
      // Show toast notification for critical activities
      if (newActivity.severity === 'critical') {
        toast.error(`Critical: ${newActivity.title}`, {
          duration: 5000,
          position: 'top-right',
        });
      }
    });

    return () => {
      websocketService.off('activity:new');
    };
  }, []);

  return { activities, isLoading };
};

export const useRealTimeVulnerabilities = () => {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const socket = websocketService.connect();
    
    websocketService.onVulnerabilityUpdate((data) => {
      queryClient.invalidateQueries({ queryKey: ['vulnerabilities'] });
      
      if (data.type === 'new' && data.vulnerability.severity === 'critical') {
        toast.error(`New Critical Vulnerability: ${data.vulnerability.title}`, {
          duration: 6000,
          position: 'top-right',
        });
      }
    });

    return () => {
      websocketService.off('vulnerability:updated');
    };
  }, [queryClient]);
};

export const useRealTimeAssets = () => {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const socket = websocketService.connect();
    
    websocketService.onAssetUpdate((data) => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    });

    return () => {
      websocketService.off('asset:updated');
    };
  }, [queryClient]);
};

export const useRealTimeAudits = () => {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const socket = websocketService.connect();
    
    websocketService.onAuditUpdate((data) => {
      queryClient.invalidateQueries({ queryKey: ['audits'] });
      
      if (data.type === 'completed') {
        toast.success(`Audit Completed: ${data.audit.title}`, {
          duration: 4000,
          position: 'top-right',
        });
      }
    });

    return () => {
      websocketService.off('audit:updated');
    };
  }, [queryClient]);
};

export const useScanProgress = (assetId?: string) => {
  const [scanProgress, setScanProgress] = useState<{
    isScanning: boolean;
    progress: number;
    stage: string;
    findings: number;
  }>({
    isScanning: false,
    progress: 0,
    stage: '',
    findings: 0,
  });

  useEffect(() => {
    if (!assetId) return;

    const socket = websocketService.connect();
    websocketService.joinRoom(`asset:${assetId}`);
    
    websocketService.onScanProgress((data) => {
      if (data.assetId === assetId) {
        setScanProgress(data);
        
        if (data.progress === 100) {
          toast.success(`Scan completed for asset ${assetId}`, {
            duration: 3000,
          });
        }
      }
    });

    return () => {
      websocketService.leaveRoom(`asset:${assetId}`);
      websocketService.off('scan:progress');
    };
  }, [assetId]);

  const startScan = () => {
    if (assetId) {
      websocketService.startScan(assetId);
      setScanProgress(prev => ({ ...prev, isScanning: true, progress: 0 }));
    }
  };

  return { scanProgress, startScan };
};