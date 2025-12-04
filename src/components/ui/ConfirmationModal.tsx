'use client'

import { Button } from '@/components/ui/Button'

interface ConfirmationModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  confirmVariant?: 'primary' | 'danger'
}

export function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  confirmVariant = 'danger'
}: ConfirmationModalProps) {
  if (!isOpen) return null

  return (
    <div className="v2-overlay" onClick={onCancel}>
      <div className="v2-modal" onClick={(e) => e.stopPropagation()}>
        <div className="v2-modal-header">
          <h2 className="v2-modal-title">
            {title}
          </h2>
          <button 
            onClick={onCancel} 
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-2xl"
          >
            ×
          </button>
        </div>

        <div className="v2-modal-body">
          <p className="text-[var(--text-primary)] mb-4">
            {message}
          </p>
        </div>

        <div className="v2-modal-footer">
          <Button variant="secondary" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button 
            variant={confirmVariant === 'danger' ? 'danger' : 'primary'} 
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}