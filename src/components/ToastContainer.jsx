import React from 'react';
import Toast from './Toast';

function ToastContainer({ toasts, removeToast }) {
  return (
    <div
      className="fixed bottom-5 right-5 z-[10000] flex flex-col gap-3 pointer-events-none"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto animate-slide-in-right">
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
            duration={toast.duration}
          />
        </div>
      ))}
    </div>
  );
}

export default ToastContainer;


