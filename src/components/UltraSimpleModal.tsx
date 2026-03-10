import React, { ReactNode, useEffect } from 'react';

interface UltraSimpleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  children: ReactNode;
}

/**
 * Modal ultra simple que se monta directamente en el body
 * para evitar conflictos con layouts existentes
 */
export function UltraSimpleModal({
  open,
  onOpenChange,
  title,
  children
}: UltraSimpleModalProps) {
  useEffect(() => {
    if (open) {
      // Prevenir scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  if (!open) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <div
      className="v2-overlay"
      style={{ zIndex: 9999 }} // Maintain high z-index for this specific global modal
      onClick={handleOverlayClick}
    >
      <div
        className="v2-modal"
        style={{
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          zIndex: 10000,
          padding: 0
        }}
      >
        {title && (
          <div className="v2-modal-header border-b border-[#333] mb-4 pb-3" style={{ padding: '1.5rem 1.5rem 0 1.5rem' }}>
            <h2 className="text-xl font-bold text-white font-[family-name:var(--font-rasputin)] tracking-wide">
              {title}
            </h2>
            <button
              onClick={handleClose}
              className="text-[#999] hover:text-white transition-colors text-2xl leading-none"
              style={{ padding: '0.25rem' }}
            >
              &times;
            </button>
          </div>
        )}
        <div className="v2-modal-body" style={{ padding: title ? '0 1.5rem 1.5rem 1.5rem' : '1.5rem' }}>
          {children}
        </div>
      </div>
    </div>
  );
}