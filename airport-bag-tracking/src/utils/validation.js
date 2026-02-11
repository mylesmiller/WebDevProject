// Validation utilities for the airport bag tracking system

// Username: minimum 2 characters followed by 2 digits
export const validateUsername = (username) => {
  const regex = /^[a-zA-Z]{2,}[0-9]{2}$/;
  return regex.test(username);
};

// Password: min 6 chars, at least one uppercase, one lowercase, one number
export const validatePassword = (password) => {
  if (password.length < 6) return { valid: false, message: 'Password must be at least 6 characters' };
  if (!/[A-Z]/.test(password)) return { valid: false, message: 'Password must contain at least one uppercase letter' };
  if (!/[a-z]/.test(password)) return { valid: false, message: 'Password must contain at least one lowercase letter' };
  if (!/[0-9]/.test(password)) return { valid: false, message: 'Password must contain at least one number' };
  return { valid: true, message: '' };
};

// Email: XXX@XXX.XXX format
export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Phone: 10 digits, first digit not zero
export const validatePhone = (phone) => {
  const regex = /^[1-9][0-9]{9}$/;
  return regex.test(phone);
};

// Name: minimum 2 letters
export const validateName = (name) => {
  const regex = /^[a-zA-Z]{2,}$/;
  return regex.test(name);
};

// Ticket number: exactly 10 digits
export const validateTicketNumber = (ticket) => {
  const regex = /^[0-9]{10}$/;
  return regex.test(ticket);
};

// Bag ID: exactly 6 digits
export const validateBagId = (bagId) => {
  const regex = /^[0-9]{6}$/;
  return regex.test(bagId);
};

// Identification: 6-digit number
export const validateIdentification = (id) => {
  const regex = /^[0-9]{6}$/;
  return regex.test(id);
};

// Airlines abbreviation: 2 letters
export const validateAirlines = (airlines) => {
  const regex = /^[A-Z]{2}$/;
  return regex.test(airlines);
};

// Flight number: 2 letters + 4 digits
export const validateFlightNumber = (flight) => {
  const regex = /^[A-Z]{2}[0-9]{4}$/;
  return regex.test(flight);
};

// Gate: Terminal letter + gate number
export const validateGate = (gate) => {
  const regex = /^[A-Z][0-9]+$/;
  return regex.test(gate);
};

// Generate random username (2+ letters + 2 digits)
export const generateUsername = (firstName, lastName) => {
  const base = (firstName.substring(0, 2) + lastName.substring(0, 2)).toLowerCase();
  const digits = String(Math.floor(Math.random() * 90) + 10);
  return base + digits;
};

// Generate random password meeting requirements
export const generatePassword = () => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const all = uppercase + lowercase + numbers;

  let password = '';
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];

  for (let i = 0; i < 5; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }

  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

// Generate unique 6-digit bag ID
export const generateBagId = () => {
  return String(Math.floor(Math.random() * 900000) + 100000);
};
