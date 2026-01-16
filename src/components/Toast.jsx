import React, { useEffect } from 'react';

function Toast({ message, type = 'info', onClose, duration = 5000 }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const typeStyles = {
    success: 'bg-green-500 border-green-600',
    error: 'bg-red-500 border-red-600',
    warning: 'bg-yellow-500 border-yellow-600',
    info: 'bg-blue-500 border-blue-600',
  };

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  return (
    <div
      className={`${typeStyles[type]} text-white px-6 py-4 rounded-md shadow-lg border-l-4 flex items-center gap-3 min-w-[300px] max-w-md animate-slide-in-right`}
      role="alert"
      aria-live="assertive"
    >
      <span className="text-xl font-bold">{icons[type]}</span>
      <p className="flex-1 font-semibold">{message}</p>
      <button
        onClick={onClose}
        className="text-white hover:text-gray-200 transition-colors font-bold text-lg leading-none"
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
}

export default Toast;


