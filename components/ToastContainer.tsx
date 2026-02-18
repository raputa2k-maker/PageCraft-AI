import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import type { Toast } from '../hooks/useToast';

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const TOAST_ICONS = {
  success: <CheckCircle size={18} className="text-emerald-400 flex-shrink-0" />,
  error: <XCircle size={18} className="text-red-400 flex-shrink-0" />,
  warning: <AlertTriangle size={18} className="text-amber-400 flex-shrink-0" />,
  info: <Info size={18} className="text-blue-400 flex-shrink-0" />,
};

const TOAST_STYLES = {
  success: 'bg-emerald-600 border-emerald-500',
  error: 'bg-red-600 border-red-500',
  warning: 'bg-amber-600 border-amber-500',
  info: 'bg-indigo-600 border-indigo-500',
};

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`
            pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl
            text-white text-sm font-medium border border-white/10
            backdrop-blur-sm cursor-pointer select-none
            ${TOAST_STYLES[toast.type]}
            ${toast.exiting ? 'animate-slide-out-right' : 'animate-slide-in-right'}
          `}
          onClick={() => onRemove(toast.id)}
        >
          {TOAST_ICONS[toast.type]}
          <span className="flex-1 leading-snug">{toast.message}</span>
          <X size={14} className="text-white/60 hover:text-white flex-shrink-0 transition-colors" />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
