import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import './Toast.css';

export enum ToastType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  details?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextValue {
  showToast: (toast: Omit<Toast, 'id'>) => string;
  hideToast: (id: string) => void;
  showSuccess: (title: string, message: string) => void;
  showError: (title: string, message: string, details?: string, action?: Toast['action']) => void;
  showWarning: (title: string, message: string) => void;
  showInfo: (title: string, message: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toast: Omit<Toast, 'id'>): string => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration || (toast.type === ToastType.ERROR ? 10000 : 5000),
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto-dismiss after duration
    if (newToast.duration) {
      setTimeout(() => {
        hideToast(id);
      }, newToast.duration);
    }

    return id;
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showSuccess = useCallback(
    (title: string, message: string) => {
      showToast({ type: ToastType.SUCCESS, title, message });
    },
    [showToast]
  );

  const showError = useCallback(
    (title: string, message: string, details?: string, action?: Toast['action']) => {
      showToast({ type: ToastType.ERROR, title, message, details, action, duration: 15000 });
    },
    [showToast]
  );

  const showWarning = useCallback(
    (title: string, message: string) => {
      showToast({ type: ToastType.WARNING, title, message });
    },
    [showToast]
  );

  const showInfo = useCallback(
    (title: string, message: string) => {
      showToast({ type: ToastType.INFO, title, message });
    },
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{ showToast, hideToast, showSuccess, showError, showWarning, showInfo }}
    >
      {children}
      <ToastContainer toasts={toasts} onDismiss={hideToast} />
    </ToastContext.Provider>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getIcon = () => {
    switch (toast.type) {
      case ToastType.SUCCESS:
        return '✅';
      case ToastType.ERROR:
        return '❌';
      case ToastType.WARNING:
        return '⚠️';
      case ToastType.INFO:
        return 'ℹ️';
    }
  };

  return (
    <div className={`toast toast-${toast.type}`}>
      <div className="toast-header">
        <div className="toast-icon">{getIcon()}</div>
        <div className="toast-content">
          <div className="toast-title">{toast.title}</div>
          <div className="toast-message">{toast.message}</div>
        </div>
        <button className="toast-close" onClick={() => onDismiss(toast.id)} aria-label="Close">
          ×
        </button>
      </div>

      {toast.details && (
        <div className="toast-details-section">
          <button
            className="toast-details-toggle"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? '▼' : '▶'} Technical Details
          </button>
          {showDetails && (
            <div className="toast-details-content">
              <pre>{toast.details}</pre>
            </div>
          )}
        </div>
      )}

      {toast.action && (
        <div className="toast-actions">
          <button className="toast-action-btn" onClick={toast.action.onClick}>
            {toast.action.label}
          </button>
        </div>
      )}
    </div>
  );
}
