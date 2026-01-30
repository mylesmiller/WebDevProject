import CryptoJS from 'crypto-js';

// Hash password using SHA256
export const hashPassword = (password) => {
  return CryptoJS.SHA256(password).toString();
};

// Verify password against hash
export const verifyPassword = (password, hash) => {
  const inputHash = hashPassword(password);
  return inputHash === hash;
};
