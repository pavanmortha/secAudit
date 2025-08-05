import React from 'react';
import { Play, Pause, RotateCcw, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useScanProgress } from '../../hooks/useRealTimeData';

interface AssetScanProgressProps {
  assetId: string;
  assetName: string;
}

export const AssetScanProgress: React.FC<AssetScanProgressProps> = ({ assetId, assetName }) => {
  const { scanProgress, startScan } = useScanProgress(assetId);

  const getProgressColor = (progress: number) => {
    if (progress < 30) return 'bg-red-500';
    if (progress < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Security Scan</h3>
          <p className="text-sm text-slate-600">{assetName}</p>
        </div>
        <button
          onClick={startScan}
          disabled={scanProgress.isScanning}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-lg transition-colors"
        >
          {scanProgress.isScanning ? (
            <>
              <Pause className="w-4 h-4" />
              <span>Scanning...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>Start Scan</span>
            </>
          )}
        </button>
      </div>

      {scanProgress.isScanning && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Progress</span>
            <span className="font-semibold text-slate-900">{scanProgress.progress}%</span>
          </div>
          
          <div className="w-full bg-slate-200 rounded-full h-2">
            <motion.div
              className={`h-2 rounded-full ${getProgressColor(scanProgress.progress)}`}
              initial={{ width: 0 }}
              animate={{ width: `${scanProgress.progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Current Stage</span>
            <span className="font-medium text-slate-900">{scanProgress.stage}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Findings</span>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              <span className="font-semibold text-orange-600">{scanProgress.findings}</span>
            </div>
          </div>
        </motion.div>
      )}

      {!scanProgress.isScanning && scanProgress.progress > 0 && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <RotateCcw className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-medium">Last scan completed</span>
          </div>
          <p className="text-sm text-green-700 mt-1">
            Found {scanProgress.findings} security issues
          </p>
        </div>
      )}
    </div>
  );
};