import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 4000,
  onClose,
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => onClose(id), duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  const typeConfig = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: <CheckCircle size={20} className="text-green-600" />,
      titleColor: 'text-green-900',
      messageColor: 'text-green-700',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: <AlertCircle size={20} className="text-red-600" />,
      titleColor: 'text-red-900',
      messageColor: 'text-red-700',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: <AlertCircle size={20} className="text-yellow-600" />,
      titleColor: 'text-yellow-900',
      messageColor: 'text-yellow-700',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: <Info size={20} className="text-blue-600" />,
      titleColor: 'text-blue-900',
      messageColor: 'text-blue-700',
    },
  };

  const config = typeConfig[type];

  return (
    <div className={`${config.bg} border ${config.border} rounded-lg p-4 shadow-lg flex items-start gap-3 min-w-[300px] max-w-[400px]`}>
      {config.icon}
      <div className="flex-1">
        <h3 className={`font-semibold ${config.titleColor}`}>{title}</h3>
        {message && <p className={`text-sm mt-1 ${config.messageColor}`}>{message}</p>}
      </div>
      <button
        onClick={() => onClose(id)}
        className="text-gray-500 hover:text-gray-700 flex-shrink-0"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
