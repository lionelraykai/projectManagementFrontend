import type { TextareaHTMLAttributes } from 'react';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export function TextArea({ label, error, id, className, ...rest }: TextAreaProps) {
  const areaId = id ?? label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="field">
      <label htmlFor={areaId}>{label}</label>
      <textarea
        id={areaId}
        className={['field-input', error ? 'field-input-error' : '', className].filter(Boolean).join(' ')}
        {...rest}
      />
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}
