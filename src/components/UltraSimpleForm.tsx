import React, { ReactNode } from 'react';

interface UltraSimpleFormProps {
  children: ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
}

export function UltraSimpleForm({ 
  children, 
  onSubmit
}: UltraSimpleFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {children}
    </form>
  );
}

interface UltraSimpleFormGroupProps {
  children: ReactNode;
  style?: React.CSSProperties;
}

export function UltraSimpleFormGroup({ 
  children, 
  style = {}
}: UltraSimpleFormGroupProps) {
  return (
    <div style={{
      marginBottom: '1rem',
      ...style
    }}>
      {children}
    </div>
  );
}

interface UltraSimpleLabelProps {
  children: ReactNode;
  htmlFor?: string;
}

export function UltraSimpleLabel({ 
  children, 
  htmlFor
}: UltraSimpleLabelProps) {
  return (
    <label 
      htmlFor={htmlFor}
      style={{
        display: 'block',
        marginBottom: '0.25rem',
        fontWeight: 600,
        fontSize: '0.875rem',
        color: '#ccc',
      }}
    >
      {children}
    </label>
  );
}

interface UltraSimpleInputProps {
  type?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  id?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
  step?: string;
  min?: string;
}

export function UltraSimpleInput({ 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  id, 
  name, 
  required, 
  disabled,
  style = {},
  step,
  min
}: UltraSimpleInputProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      id={id}
      name={name}
      required={required}
      disabled={disabled}
      step={step}
      style={{
        width: '100%',
        padding: '0.5rem 1rem',
        backgroundColor: '#3a3a3a',
        border: '1px solid #444',
        borderRadius: '4px',
        color: 'white',
        fontSize: '1rem',
        fontFamily: 'inherit',
        transition: 'border-color 0.2s',
        boxSizing: 'border-box',
        ...style
      }}
    />
  );
}

interface UltraSimpleSelectProps {
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: ReactNode;
  id?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
}

export function UltraSimpleSelect({ 
  value, 
  onChange, 
  children, 
  id, 
  name, 
  required, 
  disabled 
}: UltraSimpleSelectProps) {
  return (
    <select
      value={value}
      onChange={onChange}
      id={id}
      name={name}
      required={required}
      disabled={disabled}
      style={{
        width: '100%',
        padding: '0.5rem 1rem',
        backgroundColor: '#3a3a3a',
        border: '1px solid #444',
        borderRadius: '4px',
        color: 'white',
        fontSize: '1rem',
        fontFamily: 'inherit',
        transition: 'border-color 0.2s',
        boxSizing: 'border-box',
        appearance: 'none',
        backgroundImage: "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23cccccc' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e\")",
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 1rem center',
        backgroundSize: '1rem',
        paddingRight: '3rem',
      }}
    >
      {children}
    </select>
  );
}

interface UltraSimpleTextareaProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  id?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
}

export function UltraSimpleTextarea({ 
  value, 
  onChange, 
  placeholder, 
  id, 
  name, 
  required, 
  disabled,
  rows = 3
}: UltraSimpleTextareaProps) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      id={id}
      name={name}
      required={required}
      disabled={disabled}
      rows={rows}
      style={{
        width: '100%',
        padding: '0.5rem 1rem',
        backgroundColor: '#3a3a3a',
        border: '1px solid #444',
        borderRadius: '4px',
        color: 'white',
        fontSize: '1rem',
        fontFamily: 'inherit',
        transition: 'border-color 0.2s',
        boxSizing: 'border-box',
        resize: 'vertical',
        minHeight: '100px',
      }}
    />
  );
}

interface UltraSimpleButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}

export function UltraSimpleButton({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  disabled 
}: UltraSimpleButtonProps) {
  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    fontWeight: 600,
    fontSize: '1rem',
    fontFamily: 'inherit',
    cursor: disabled ? 'not-allowed' : 'pointer',
    border: 'none',
    transition: 'all 0.3s',
    position: 'relative',
    overflow: 'hidden',
    lineHeight: 1,
    minHeight: '40px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: '#FF7700',
      color: 'white',
      boxShadow: '0 2px 4px rgba(255, 119, 0, 0.3)',
    },
    secondary: {
      backgroundColor: '#3a3a3a',
      color: 'white',
      border: '1px solid #444',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    },
    danger: {
      backgroundColor: '#ef4444',
      color: 'white',
      boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)',
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...(baseStyle as React.CSSProperties),
        ...variantStyles[variant],
      }}
    >
      {children}
    </button>
  );
}

interface UltraSimpleModalFooterProps {
  children: ReactNode;
  style?: React.CSSProperties;
}

export function UltraSimpleModalFooter({ 
  children, 
  style = {}
}: UltraSimpleModalFooterProps) {
  return (
    <div style={{
      display: 'flex',
      gap: '0.5rem',
      justifyContent: 'flex-end',
      paddingTop: '1rem',
      borderTop: '1px solid #444',
      ...style
    }}>
      {children}
    </div>
  );
}