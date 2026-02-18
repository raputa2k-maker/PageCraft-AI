import React, { createContext, useContext } from 'react';
import { useToast, ToastType } from '../hooks/useToast';
import ToastContainer from '../components/ToastContainer';

interface ToastContextValue {
  addToast: (message: string, type?: ToastType, duration?: number) => string;
}

const ToastContext = createContext<ToastContextValue>({
  addToast: () => '',
});

export const useToastContext = () => useContext(ToastContext);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toasts, addToast, removeToast } = useToast();

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};
