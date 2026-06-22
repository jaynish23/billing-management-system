import { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((type, title, message) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [...prev, { id, type, title, message }]);
    
    // Auto close after 3 seconds (3000ms)
    setTimeout(() => {
      removeNotification(id);
    }, 3000);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const showSuccess = useCallback((title, message) => {
    addNotification('success', title, message);
  }, [addNotification]);

  const showError = useCallback((title, message) => {
    addNotification('error', title, message);
  }, [addNotification]);

  const showWarning = useCallback((title, message) => {
    addNotification('warning', title, message);
  }, [addNotification]);

  const showInfo = useCallback((title, message) => {
    addNotification('info', title, message);
  }, [addNotification]);

  return (
    <NotificationContext.Provider value={{ showSuccess, showError, showWarning, showInfo }}>
      {children}
      
      {/* Toast container portal */}
      {createPortal(
        <div className="fixed top-4 right-4 md:top-6 md:right-6 left-4 md:left-auto z-[99999] flex flex-col items-center md:items-end gap-3 pointer-events-none max-w-sm w-[calc(100%-2rem)] md:w-[380px]">
          <AnimatePresence>
            {notifications.map((toast) => {
              // Accent border classes
              let borderClass = 'border-l-4 border-blue-500';
              let iconBg = 'bg-blue-500/10 text-blue-400';
              let emoji = 'ℹ️';

              if (toast.type === 'success') {
                borderClass = 'border-l-4 border-emerald-500';
                iconBg = 'bg-emerald-500/10 text-emerald-400';
                emoji = '✅';
              } else if (toast.type === 'error') {
                borderClass = 'border-l-4 border-rose-500';
                iconBg = 'bg-rose-500/10 text-rose-400';
                emoji = '❌';
              } else if (toast.type === 'warning') {
                borderClass = 'border-l-4 border-amber-500';
                iconBg = 'bg-amber-500/10 text-amber-400';
                emoji = '⚠️';
              }

              return (
                <motion.div
                  key={toast.id}
                  layout
                  initial={{ opacity: 0, y: -20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.15 } }}
                  transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                  className={`pointer-events-auto w-full glass-card bg-bg-lighter/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-border-base/50 flex gap-3 ${borderClass} relative overflow-hidden select-none`}
                >
                  {/* Icon badge */}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0 ${iconBg} font-bold shadow-sm`}>
                    {emoji}
                  </div>

                  {/* Text content */}
                  <div className="flex-1 min-w-0 pr-4">
                    <h4 className="text-sm font-bold text-text-primary tracking-tight leading-tight">
                      {toast.title}
                    </h4>
                    {toast.message && (
                      <p className="text-xs text-text-secondary mt-1 font-semibold leading-relaxed break-words">
                        {toast.message}
                      </p>
                    )}
                  </div>

                  {/* Close button */}
                  <button
                    onClick={() => removeNotification(toast.id)}
                    className="absolute top-3 right-3 p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-darker transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>,
        document.body
      )}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
