import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Input({ label, error, id, className, ...rest }: InputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="field">
      <label htmlFor={inputId}>{label}</label>
      <input
        id={inputId}
        className={['field-input', error ? 'field-input-error' : '', className].filter(Boolean).join(' ')}
        {...rest}
      />
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}
