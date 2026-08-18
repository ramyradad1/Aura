import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  action?: ToastAction;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, action?: ToastAction) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toast = (message: string, type: ToastType = 'info', action?: ToastAction) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, action }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-indigo-500" />;
    }
  };

  const getBgClass = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'bg-[#0f172a] text-white border-emerald-500/30 shadow-emerald-950/40';
      case 'error':
        return 'bg-[#0f172a] text-white border-red-500/30 shadow-red-950/40';
      default:
        return 'bg-[#0f172a] text-white border-indigo-500/30 shadow-indigo-950/40';
    }
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 pointer-events-none" dir="rtl">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: 20, transition: { duration: 0.2 } }}
              className={`pointer-events-auto flex items-center gap-3 p-4 rounded-2xl border shadow-2xl backdrop-blur-xl w-88 max-w-[92vw] ${getBgClass(
                t.type
              )}`}
            >
              <div className="shrink-0">{getIcon(t.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium leading-snug">{t.message}</p>
                {t.action && (
                  <button
                    type="button"
                    onClick={() => {
                      t.action?.onClick();
                      removeToast(t.id);
                    }}
                    className="mt-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors cursor-pointer"
                  >
                    {t.action.label}
                  </button>
                )}
              </div>
              <button
                title="إغلاق التنبيه"
                onClick={() => removeToast(t.id)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                aria-label="إغلاق التنبيه"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
