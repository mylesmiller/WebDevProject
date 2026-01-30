import React from 'react';
import '../../styles/global.css';

const ErrorMessage = ({ message }) => {
  if (!message) return null;

  return <div className="error-message">{message}</div>;
};

export default ErrorMessage;
