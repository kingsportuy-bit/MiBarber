import React, { ReactNode } from 'react';
import './V2Form.css';

interface LegacyV2ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Componente de modal V2 para páginas antiguas
 * Replica visualmente los estilos V2 pero funciona independientemente
 */
export function LegacyV2Modal({ 
  open, 
  onOpenChange, 
  title, 
  children,
  className = ''
}: LegacyV2ModalProps) {
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
        {title && (
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

interface LegacyV2FormProps {
  children: ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  className?: string;
}

export function LegacyV2Form({ 
  children, 
  onSubmit,
  className = '' 
}: LegacyV2FormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`v2-form-standalone ${className}`}>
      {children}
    </form>
  );
}

interface LegacyV2FormSectionProps {
  children: ReactNode;
  className?: string;
}

export function LegacyV2FormSection({ 
  children, 
  className = '' 
}: LegacyV2FormSectionProps) {
  return (
    <div className={`v2-form-section ${className}`}>
      {children}
    </div>
  );
}

interface LegacyV2FormGroupProps {
  children: ReactNode;
  className?: string;
}

export function LegacyV2FormGroup({ 
  children, 
  className = '' 
}: LegacyV2FormGroupProps) {
  return (
    <div className={`v2-form-group ${className}`}>
      {children}
    </div>
  );
}

interface LegacyV2LabelProps {
  children: ReactNode;
  htmlFor?: string;
  className?: string;
}

export function LegacyV2Label({ 
  children, 
  htmlFor,
  className = '' 
}: LegacyV2LabelProps) {
  return (
    <label htmlFor={htmlFor} className={`v2-label ${className}`}>
      {children}
    </label>
  );
}

interface LegacyV2InputProps {
  type?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  step?: string;
}

export function LegacyV2Input({ 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  className = '', 
  id, 
  name, 
  required, 
  disabled,
  step
}: LegacyV2InputProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`v2-input ${className}`}
      id={id}
      name={name}
      required={required}
      disabled={disabled}
      step={step}
    />
  );
}

interface LegacyV2SelectProps {
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: ReactNode;
  className?: string;
  id?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
}

export function LegacyV2Select({ 
  value, 
  onChange, 
  children, 
  className = '', 
  id, 
  name, 
  required, 
  disabled 
}: LegacyV2SelectProps) {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`v2-select ${className}`}
      id={id}
      name={name}
      required={required}
      disabled={disabled}
    >
      {children}
    </select>
  );
}

interface LegacyV2TextareaProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
}

export function LegacyV2Textarea({ 
  value, 
  onChange, 
  placeholder, 
  className = '', 
  id, 
  name, 
  required, 
  disabled,
  rows = 3
}: LegacyV2TextareaProps) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`v2-textarea ${className}`}
      id={id}
      name={name}
      required={required}
      disabled={disabled}
      rows={rows}
    />
  );
}

interface LegacyV2ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
  disabled?: boolean;
}

export function LegacyV2Button({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  className = '', 
  disabled 
}: LegacyV2ButtonProps) {
  const variantClass = `v2-btn-${variant}`;
  
  return (
    <button
      type={type}
      onClick={onClick}
      className={`v2-btn ${variantClass} ${className}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

interface LegacyV2ModalFooterProps {
  children: ReactNode;
  className?: string;
}

export function LegacyV2ModalFooter({ 
  children, 
  className = '' 
}: LegacyV2ModalFooterProps) {
  return (
    <div className={`v2-standalone-modal-footer ${className}`}>
      {children}
    </div>
  );
}