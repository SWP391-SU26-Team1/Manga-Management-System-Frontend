import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CheckCircle2 } from 'lucide-react';

interface ToastContextType {
  showToast: (msg: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Global Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 bg-manga-ink text-white px-6 py-3 font-bold text-sm border-2 border-white shadow-[4px_4px_0px_0px_rgba(230,57,70,1)] flex items-center gap-3 z-[9999] animate-fade-in uppercase">
          <CheckCircle2 className="w-5 h-5 text-[#E63946]" />
          {toastMsg}
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
