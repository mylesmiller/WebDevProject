import React from 'react';
import './FormInput.css';

const FormInput = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  error,
  placeholder,
  required = false,
  disabled = false,
  maxLength,
  minLength,
  pattern,
  options, // for select
}) => {
  const inputId = `input-${name}`;

  if (type === 'select') {
    return (
      <div className="form-group">
        <label htmlFor={inputId}>
          {label}
          {required && <span className="required">*</span>}
        </label>
        <select
          id={inputId}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={error ? 'error' : ''}
        >
          <option value="">Select {label}</option>
          {options?.map((opt, index) => (
            <option key={index} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <span className="error-message">{error}</span>}
      </div>
    );
  }

  return (
    <div className="form-group">
      <label htmlFor={inputId}>
        {label}
        {required && <span className="required">*</span>}
      </label>
      <input
        id={inputId}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        minLength={minLength}
        pattern={pattern}
        className={error ? 'error' : ''}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

export default FormInput;
