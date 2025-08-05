import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import websocketService from '../../services/websocket';

export const RealTimeIndicator: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    const socket = websocketService.connect();
    
    socket.on('connect', () => {
      setIsConnected(true);
      setLastUpdate(new Date());
    });
    
    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Listen for any real-time updates to show activity
    const updateLastUpdate = () => setLastUpdate(new Date());
    
    websocketService.onMetricsUpdate(updateLastUpdate);
    websocketService.onNewActivity(updateLastUpdate);
    websocketService.onVulnerabilityUpdate(updateLastUpdate);
    websocketService.onAssetUpdate(updateLastUpdate);
    websocketService.onAuditUpdate(updateLastUpdate);

    return () => {
      websocketService.off('metrics:updated', updateLastUpdate);
      websocketService.off('activity:new', updateLastUpdate);
      websocketService.off('vulnerability:updated', updateLastUpdate);
      websocketService.off('asset:updated', updateLastUpdate);
      websocketService.off('audit:updated', updateLastUpdate);
    };
  }, []);

  return (
    <div className="flex items-center space-x-2 text-sm">
      <div className={`flex items-center space-x-1 ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
        {isConnected ? (
          <Wifi className="w-4 h-4" />
        ) : (
          <WifiOff className="w-4 h-4" />
        )}
        <span className="font-medium">
          {isConnected ? 'Live' : 'Offline'}
        </span>
      </div>
      {lastUpdate && (
        <span className="text-slate-500">
          • Updated {lastUpdate.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
};