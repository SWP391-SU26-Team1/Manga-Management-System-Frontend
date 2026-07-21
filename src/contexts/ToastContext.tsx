import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react';

interface ToastContextType {
  showToast: (msg: string, type?: 'success' | 'error' | 'warning') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toastData, setToastData] = useState<{msg: string, type: 'success' | 'error' | 'warning'} | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToastData({ msg, type });
    setTimeout(() => setToastData(null), 3000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Global Toast */}
      {toastData && (
        <div className={`fixed top-6 right-6 px-6 py-3 font-bold text-sm border-2 shadow-[4px_4px_0px_0px_rgba(230,57,70,1)] flex items-center gap-3 z-[99999] animate-fade-in uppercase ${
          toastData.type === 'error' ? 'bg-white text-manga-red border-manga-red' : 
          toastData.type === 'warning' ? 'bg-white text-orange-500 border-orange-500 shadow-[4px_4px_0px_0px_rgba(249,115,22,1)]' : 
          'bg-manga-ink text-white border-white'
        }`}>
          {toastData.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#E63946]" />}
          {toastData.type === 'error' && <AlertCircle className="w-5 h-5 text-manga-red" />}
          {toastData.type === 'warning' && <AlertTriangle className="w-5 h-5 text-orange-500" />}
          {toastData.msg}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
