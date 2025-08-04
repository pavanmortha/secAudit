import { useState, useCallback } from 'react';

interface ToastState {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  isVisible: boolean;
}

export const useToast = () => {
  const [toast, setToast] = useState<ToastState>({
    type: 'info',
    message: '',
    isVisible: false
  });

  const showToast = useCallback((type: ToastState['type'], message: string) => {
    setToast({
      type,
      message,
      isVisible: true
    });
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({
      ...prev,
      isVisible: false
    }));
  }, []);

  const showSuccess = useCallback((message: string) => {
    showToast('success', message);
  }, [showToast]);

  const showError = useCallback((message: string) => {
    showToast('error', message);
  }, [showToast]);

  const showWarning = useCallback((message: string) => {
    showToast('warning', message);
  }, [showToast]);

  const showInfo = useCallback((message: string) => {
    showToast('info', message);
  }, [showToast]);

  return {
    toast,
    showToast,
    hideToast,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};