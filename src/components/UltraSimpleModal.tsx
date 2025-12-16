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
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={handleOverlayClick}
    >
      <div 
        style={{
          backgroundColor: '#2a2a2a',
          border: '1px solid #444',
          borderRadius: '8px',
          padding: '1.5rem',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          zIndex: 10000,
          color: 'white',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        }}
      >
        {title && (
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid #444',
              fontSize: '1.25rem',
              fontWeight: 600,
            }}
          >
            <h2>{title}</h2>
            <button 
              onClick={handleClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#999',
                fontSize: '1.5rem',
                cursor: 'pointer',
                padding: '0',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px',
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#3a3a3a'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              ×
            </button>
          </div>
        )}
        <div>
          {children}
        </div>
      </div>
    </div>
  );
}