import { useState, useCallback, createContext, useContext, ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `${Date.now()}-${Math.random()}`;
    const toastWithId = { ...toast, id };
    setToasts((prev) => [...prev, toastWithId]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }

  return {
    ...context,
    success: (title: string, message?: string, duration?: number) =>
      context.addToast({ type: 'success', title, message, duration }),
    error: (title: string, message?: string, duration?: number) =>
      context.addToast({ type: 'error', title, message, duration }),
    warning: (title: string, message?: string, duration?: number) =>
      context.addToast({ type: 'warning', title, message, duration }),
    info: (title: string, message?: string, duration?: number) =>
      context.addToast({ type: 'info', title, message, duration }),
  };
};

export default useToast;
