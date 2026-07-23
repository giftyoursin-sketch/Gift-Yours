import React, { useEffect, useRef } from 'react';
import { X, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

export default function ToastContainer() {
  const { notifications, dispatch } = useApp();
  const timers = useRef({});

  useEffect(() => {
    notifications.forEach(n => {
      if (!timers.current[n.id]) {
        timers.current[n.id] = setTimeout(() => {
          // Auto-dismiss handled by notification age
        }, 4000);
      }
    });
  }, [notifications]);

  // Show only the last 4, and auto-remove after 4s by filtering
  const visible = notifications.slice(0, 4);

  return (
    <div className="toast-container">
      {visible.map(n => {
        const Icon = ICONS[n.type] || Info;
        return (
          <div key={n.id} className={`toast toast-${n.type}`} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Icon size={18} />
            <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: 500 }}>{n.message}</span>
          </div>
        );
      })}
    </div>
  );
}
