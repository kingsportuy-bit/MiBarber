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
      className="block mb-1 text-[12px] font-medium text-[#8a8a8a] uppercase tracking-wider font-[family-name:var(--font-body)]"
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
      value={value === null || value === undefined ? "" : value}
      onChange={onChange}
      placeholder={placeholder}
      id={id}
      name={name}
      required={required}
      disabled={disabled}
      step={step}
      min={min}
      className="w-full app-input text-[14px]"
      style={style}
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
      value={value === null || value === undefined ? "" : value}
      onChange={onChange}
      id={id}
      name={name}
      required={required}
      disabled={disabled}
      className="w-full app-input cursor-pointer appearance-none text-[14px]"
      style={{
        backgroundImage: "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23cccccc' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e\")",
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 1rem center',
        backgroundSize: '1rem',
        paddingRight: '2.5rem',
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
      value={value === null || value === undefined ? "" : value}
      onChange={onChange}
      placeholder={placeholder}
      id={id}
      name={name}
      required={required}
      disabled={disabled}
      rows={rows}
      className="w-full app-input resize-y min-h-[100px] text-[14px]"
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
  // Use V3 button styles
  let btnClass = "";
  if (variant === 'primary') {
    btnClass = "app-btn-primary w-full sm:w-auto text-[11px] font-bold tracking-widest uppercase py-3 px-6";
  } else if (variant === 'danger') {
    btnClass = "w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold tracking-widest uppercase transition-all duration-300 disabled:opacity-50 text-[11px]";
  } else {
    // Secondary
    btnClass = "w-full sm:w-auto px-6 py-3 bg-[#1a1a1a] hover:bg-[#333] border border-[#333] text-gray-300 font-bold tracking-[0.2em] uppercase transition-all duration-300 disabled:opacity-50 text-[11px] font-[family-name:var(--font-rasputin)]";
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={btnClass}
      style={{
        lineHeight: 1,
        minHeight: '40px',
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
    <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-5 mt-6 border-t border-[#333]" style={style}>
      {children}
    </div>
  );
}