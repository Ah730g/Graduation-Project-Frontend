import React, { useEffect, useRef } from 'react';

function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'danger', // danger, warning, info
}) {
  const modalRef = useRef(null);
  const confirmButtonRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Trap focus within modal
      const handleTabKey = (e) => {
        if (e.key !== 'Tab') return;

        const focusableElements = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      };

      // Handle ESC key
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          onCancel();
        }
      };

      document.addEventListener('keydown', handleTabKey);
      document.addEventListener('keydown', handleEscape);

      // Focus confirm button on open
      setTimeout(() => {
        confirmButtonRef.current?.focus();
      }, 100);

      return () => {
        document.removeEventListener('keydown', handleTabKey);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onCancel]);

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

  const styles = variantStyles[variant] || variantStyles.danger;

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
              <p className="text-gray-700">{message}</p>
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
              onClick={onConfirm}
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

export default ConfirmationModal;

