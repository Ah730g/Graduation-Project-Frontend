import React, { useEffect, useRef, useState } from 'react';

function PromptModal({
  isOpen,
  title,
  message,
  placeholder = '',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  required = false,
  variant = 'warning',
}) {
  const modalRef = useRef(null);
  const inputRef = useRef(null);
  const confirmButtonRef = useRef(null);
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setValue('');
      setError('');
      // Focus input on open
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      // Handle ESC key
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          onCancel();
        }
      };

      document.addEventListener('keydown', handleEscape);

      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onCancel]);

  const handleConfirm = () => {
    if (required && !value.trim()) {
      setError('This field is required');
      inputRef.current?.focus();
      return;
    }
    onConfirm(value.trim());
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleConfirm();
    }
  };

  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      button: 'bg-red-500 hover:bg-red-600 text-white',
      icon: '⚠',
    },
    warning: {
      button: 'bg-yellow-300 hover:bg-yellow-400 text-[#444]',
      icon: '⚠',
    },
    info: {
      button: 'bg-yellow-300 hover:bg-yellow-400 text-[#444]',
      icon: 'ℹ',
    },
  };

  const styles = variantStyles[variant] || variantStyles.warning;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onCancel();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-md shadow-xl max-w-md w-full mx-4 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <span className="text-3xl">{styles.icon}</span>
            <div className="flex-1">
              <h3 id="modal-title" className="text-xl font-bold text-[#444] mb-2">
                {title}
              </h3>
              <p className="text-gray-700 mb-4">{message}</p>
              <div>
                <textarea
                  ref={inputRef}
                  value={value}
                  onChange={(e) => {
                    setValue(e.target.value);
                    setError('');
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder={placeholder}
                  rows={4}
                  className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300 ${
                    error ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {error && (
                  <p className="text-red-500 text-sm mt-1">{error}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end mt-6">
            <button
              onClick={onCancel}
              className="bg-gray-200 hover:bg-gray-300 text-[#444] px-6 py-2 rounded-md font-semibold transition duration-300 ease hover:scale-105"
            >
              {cancelText}
            </button>
            <button
              ref={confirmButtonRef}
              onClick={handleConfirm}
              className={`${styles.button} px-6 py-2 rounded-md font-semibold transition duration-300 ease hover:scale-105`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PromptModal;
