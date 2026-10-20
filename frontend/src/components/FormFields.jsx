import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

// Label + input + hint/error, laid out the same way everywhere.
// A password field gets a show/hide button automatically.
export function TextField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  hint,
  multiline = false,
  autoComplete,
  autoFocus = false,
  maxLength,
}) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === 'password';
  const inputId = `field-${name}`;
  const messageId = `${inputId}-message`;

  const inputProps = {
    id: inputId,
    name,
    value,
    onChange,
    onBlur,
    autoComplete,
    autoFocus,
    maxLength,
    'aria-invalid': error ? 'true' : undefined,
    'aria-describedby': error || hint ? messageId : undefined,
  };

  return (
    <div className="field">
      <label htmlFor={inputId}>{label}</label>
      {multiline ? (
        <textarea rows={3} {...inputProps} />
      ) : isPassword ? (
        <div className="input-with-action">
          <input type={visible ? 'text' : 'password'} {...inputProps} />
          <button
            type="button"
            className="input-action"
            onClick={() => setVisible((v) => !v)}
            aria-pressed={visible}
            aria-label={visible ? 'Hide password' : 'Show password'}
            title={visible ? 'Hide password' : 'Show password'}
          >
            {visible ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
          </button>
        </div>
      ) : (
        <input type={type} {...inputProps} />
      )}
      {(error || hint) && (
        <p id={messageId} className={error ? 'field-error' : 'field-hint'}>
          {error || hint}
        </p>
      )}
    </div>
  );
}

export function SelectField({ label, name, value, onChange, onBlur, error, hint, children }) {
  const inputId = `field-${name}`;
  const messageId = `${inputId}-message`;

  return (
    <div className="field">
      <label htmlFor={inputId}>{label}</label>
      <select
        id={inputId}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error || hint ? messageId : undefined}
      >
        {children}
      </select>
      {(error || hint) && (
        <p id={messageId} className={error ? 'field-error' : 'field-hint'}>
          {error || hint}
        </p>
      )}
    </div>
  );
}
