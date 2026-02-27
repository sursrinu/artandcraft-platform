import React from 'react';
import { AlertCircle, CheckCircle, XCircle, Info, X } from 'lucide-react';

interface AlertProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  onClose?: () => void;
  closeable?: boolean;
}

const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  message,
  onClose,
  closeable = true,
}) => {
  const typeConfig = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: <CheckCircle className="text-green-600" size={20} />,
      titleColor: 'text-green-900',
      messageColor: 'text-green-700',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: <XCircle className="text-red-600" size={20} />,
      titleColor: 'text-red-900',
      messageColor: 'text-red-700',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: <AlertCircle className="text-yellow-600" size={20} />,
      titleColor: 'text-yellow-900',
      messageColor: 'text-yellow-700',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: <Info className="text-blue-600" size={20} />,
      titleColor: 'text-blue-900',
      messageColor: 'text-blue-700',
    },
  };

  const config = typeConfig[type];

  return (
    <div className={`${config.bg} border ${config.border} rounded-lg p-4`}>
      <div className="flex gap-3">
        <div className="flex-shrink-0">{config.icon}</div>
        <div className="flex-1">
          {title && <h3 className={`font-semibold ${config.titleColor} mb-1`}>{title}</h3>}
          <p className={`text-sm ${config.messageColor}`}>{message}</p>
        </div>
        {closeable && onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;
