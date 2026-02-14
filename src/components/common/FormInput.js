import React, { useState } from 'react';
import '../../styles/forms.css';

const FormInput = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  validator,
  required = false,
  placeholder = '',
  disabled = false,
  error: externalError,
  helpText,
  ...props
}) => {
  const [internalError, setInternalError] = useState('');
  const [touched, setTouched] = useState(false);

  // External error takes priority over internal validation error
  const error = externalError || internalError;
  const showError = error && (touched || externalError);

  const handleBlur = (e) => {
    setTouched(true);

    if (validator) {
      const errorMsg = validator(value);
      setInternalError(errorMsg || '');
    }

    if (onBlur) {
      onBlur(e);
    }
  };

  const handleChange = (e) => {
    onChange(e);

    // Clear error on change if field was touched
    if (touched && validator) {
      const errorMsg = validator(e.target.value);
      setInternalError(errorMsg || '');
    }
  };

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={name} className="form-label">
          {label}
          {required && <span style={{ color: 'var(--danger-color)' }}> *</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={`form-input ${showError ? 'error' : ''}`}
        {...props}
      />
      {helpText && !showError && (
        <div className="form-help" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginTop: '4px' }}>
          {helpText}
        </div>
      )}
      {showError && <div className="form-error">{error}</div>}
    </div>
  );
};

export default FormInput;
