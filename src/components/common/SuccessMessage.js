import React from 'react';
import '../../styles/global.css';

const SuccessMessage = ({ message }) => {
  if (!message) return null;

  return <div className="success-message">{message}</div>;
};

export default SuccessMessage;
