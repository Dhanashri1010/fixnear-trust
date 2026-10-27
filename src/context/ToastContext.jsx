// ===================================================================
// FixNear Trust - Toast Notification Context & Toast Container
// Accessible, high-contrast, responsive toasts with icons
// ===================================================================

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    const newToast = { id, message, type, duration };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      {/* Toast Notification Container */}
      <aside 
        aria-live="polite" 
        aria-atomic="true"
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          maxWidth: '420px',
          width: 'calc(100vw - 40px)',
          pointerEvents: 'none'
        }}
      >
        {toasts.map((toast) => {
          let bg = 'var(--bg-card)';
          let border = 'var(--border-light)';
          let text = 'var(--text-primary)';
          let Icon = Info;
          let iconColor = 'var(--forest-700)';

          if (toast.type === 'success') {
            bg = '#F0FDF4';
            border = '#86EFAC';
            text = '#14532D';
            Icon = CheckCircle2;
            iconColor = '#16A34A';
          } else if (toast.type === 'error') {
            bg = '#FEF2F2';
            border = '#FCA5A5';
            text = '#7F1D1D';
            Icon = AlertCircle;
            iconColor = '#DC2626';
          } else if (toast.type === 'warning') {
            bg = '#FFFBEB';
            border = '#FDE68A';
            text = '#78350F';
            Icon = AlertTriangle;
            iconColor = '#D97706';
          } else if (toast.type === 'info') {
            bg = '#F0F9FF';
            border = '#BAE6FD';
            text = '#0C4A6E';
            Icon = Info;
            iconColor = '#0284C7';
          }

          return (
            <div
              key={toast.id}
              role="alert"
              style={{
                pointerEvents: 'auto',
                backgroundColor: bg,
                border: `1.5px solid ${border}`,
                borderRadius: 'var(--radius-md)',
                padding: '14px 16px',
                boxShadow: 'var(--shadow-lg)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                color: text,
                fontSize: '15px',
                fontWeight: 600,
                animation: 'fadeInSlide 200ms ease',
                minHeight: '48px'
              }}
            >
              <Icon size={20} color={iconColor} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ flex: 1, lineHeight: 1.4 }}>
                {toast.message}
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                aria-label="Close notification"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: text,
                  opacity: 0.7,
                  transition: 'opacity 150ms ease'
                }}
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </aside>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
