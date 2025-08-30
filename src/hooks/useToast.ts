import { useState, useRef, useCallback } from 'react';

interface ToastState {
  isOpen: boolean;
  message: string;
  color: 'success' | 'danger' | 'warning';
}

export const useToast = () => {
  const [toastState, setToastState] = useState<ToastState>({
    isOpen: false,
    message: '',
    color: 'success'
  });
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isShowingRef = useRef(false);

  const showToast = useCallback((
    message: string, 
    color: 'success' | 'danger' | 'warning' = 'success'
  ) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // If a toast is already showing, close it first
    if (isShowingRef.current) {
      setToastState(prev => ({ ...prev, isOpen: false }));
      
      // Wait for the previous toast to close before showing new one
      timeoutRef.current = setTimeout(() => {
        setToastState({
          isOpen: true,
          message,
          color
        });
        isShowingRef.current = true;
      }, 200);
    } else {
      // Show the toast immediately if none is showing
      setToastState({
        isOpen: true,
        message,
        color
      });
      isShowingRef.current = true;
    }
  }, []);

  const hideToast = useCallback(() => {
    setToastState(prev => ({ ...prev, isOpen: false }));
    isShowingRef.current = false;
    
    // Clear message after animation completes
    timeoutRef.current = setTimeout(() => {
      setToastState(prev => ({ ...prev, message: '' }));
    }, 300);
  }, []);

  // Cleanup timeout on unmount
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return {
    toastState,
    showToast,
    hideToast,
    cleanup
  };
};
