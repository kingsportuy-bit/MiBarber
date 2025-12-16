import React, { ReactNode } from 'react';
import './V2Form.css';

interface V2StandaloneModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  title?: string;
  className?: string;
}

/**
 * Componente de modal V2 independiente que puede usarse en páginas antiguas
 * sin necesidad de estar dentro del layout V2
 */
export function V2StandaloneModal({ 
  open, 
  onOpenChange, 
  children, 
  title,
  className = '' 
}: V2StandaloneModalProps) {
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
      className="v2-standalone-overlay"
      onClick={handleOverlayClick}
    >
      <div className={`v2-standalone-modal ${className}`}>
        {(title || title === '') && (
          <div className="v2-standalone-modal-header">
            <h2 className="v2-standalone-modal-title">{title}</h2>
            <button 
              onClick={handleClose}
              className="v2-standalone-modal-close"
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>
        )}
        <div className="v2-standalone-modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}