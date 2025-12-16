import React, { ReactNode } from 'react';
import './V2Form.css';

interface V2FormProps {
  children: ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  className?: string;
}

/**
 * Componente de formulario V2 independiente que puede usarse en páginas antiguas
 * sin necesidad de estar dentro del layout V2
 */
export function V2Form({ children, onSubmit, className = '' }: V2FormProps) {
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

interface V2FormHeaderProps {
  children: ReactNode;
  className?: string;
}

export function V2FormHeader({ children, className = '' }: V2FormHeaderProps) {
  return (
    <div className={`v2-form-header ${className}`}>
      {children}
    </div>
  );
}

interface V2FormTitleProps {
  children: ReactNode;
  className?: string;
}

export function V2FormTitle({ children, className = '' }: V2FormTitleProps) {
  return (
    <h2 className={`v2-form-title ${className}`}>
      {children}
    </h2>
  );
}

interface V2FormBodyProps {
  children: ReactNode;
  className?: string;
}

export function V2FormBody({ children, className = '' }: V2FormBodyProps) {
  return (
    <div className={`v2-form-body ${className}`}>
      {children}
    </div>
  );
}

interface V2FormFooterProps {
  children: ReactNode;
  className?: string;
}

export function V2FormFooter({ children, className = '' }: V2FormFooterProps) {
  return (
    <div className={`v2-form-footer ${className}`}>
      {children}
    </div>
  );
}

interface V2FormGroupProps {
  children: ReactNode;
  className?: string;
}

export function V2FormGroup({ children, className = '' }: V2FormGroupProps) {
  return (
    <div className={`v2-form-group ${className}`}>
      {children}
    </div>
  );
}

interface V2LabelProps {
  children: ReactNode;
  htmlFor?: string;
  className?: string;
}

export function V2Label({ children, htmlFor, className = '' }: V2LabelProps) {
  return (
    <label htmlFor={htmlFor} className={`v2-label ${className}`}>
      {children}
    </label>
  );
}

interface V2InputProps {
  type?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
}

export function V2Input({ 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  className = '', 
  id, 
  name, 
  required, 
  disabled 
}: V2InputProps) {
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
    />
  );
}

interface V2SelectProps {
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: ReactNode;
  className?: string;
  id?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
}

export function V2Select({ 
  value, 
  onChange, 
  children, 
  className = '', 
  id, 
  name, 
  required, 
  disabled 
}: V2SelectProps) {
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

interface V2TextareaProps {
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

export function V2Textarea({ 
  value, 
  onChange, 
  placeholder, 
  className = '', 
  id, 
  name, 
  required, 
  disabled,
  rows = 3
}: V2TextareaProps) {
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

interface V2ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
  disabled?: boolean;
}

export function V2Button({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  className = '', 
  disabled 
}: V2ButtonProps) {
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