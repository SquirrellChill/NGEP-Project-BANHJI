import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import './TextField.css';

export default function PasswordField({ label, error, helperText, ...props }) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="text-field">
      <span className="text-field-label">{label}</span>
      <div className="password-field-wrap">
        <input
          type={visible ? 'text' : 'password'}
          className={`text-field-input ${error ? 'has-error' : ''}`}
          {...props}
        />
        <button
          type="button"
          className="password-toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {helperText && !error && <span className="text-field-helper">{helperText}</span>}
      {error && <span className="text-field-error">{error}</span>}
    </label>
  );
}