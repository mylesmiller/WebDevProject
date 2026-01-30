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
  ...props
}) => {
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  const handleBlur = (e) => {
    setTouched(true);

    if (validator) {
      const errorMsg = validator(value);
      setError(errorMsg || '');
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
      setError(errorMsg || '');
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
        className={`form-input ${error && touched ? 'error' : ''}`}
        {...props}
      />
      {error && touched && <div className="form-error">{error}</div>}
    </div>
  );
};

export default FormInput;
