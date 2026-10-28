import React from 'react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  return (
    <div className={`toast-container toast-${toast.type || 'info'}`}>
      <div className="toast-icon">
        {toast.type === 'success' ? '✓' : '⚡'}
      </div>
      <div className="toast-content">
        <div className="toast-title">{toast.title}</div>
        <div className="toast-message">{toast.message}</div>
      </div>
      <button className="toast-close" onClick={onClose} aria-label="Close">✕</button>
    </div>
  );
}
