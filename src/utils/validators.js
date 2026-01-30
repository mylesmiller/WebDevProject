import { PATTERNS } from './constants';

// Validation error messages
const ERROR_MESSAGES = {
  REQUIRED: 'This field is required',
  BAG_ID: 'Bag ID must be exactly 6 digits',
  TICKET_NUMBER: 'Ticket number must be exactly 10 digits',
  PASSENGER_ID: 'Passenger ID must be exactly 6 digits',
  FLIGHT_NUMBER: 'Flight number must be 2 uppercase letters followed by 4 digits (e.g., AA1234)',
  AIRLINE_CODE: 'Airline code must be 2 uppercase letters',
  USERNAME: 'Username must be at least 2 letters followed by at least 2 digits',
  PASSWORD: 'Password must be at least 6 characters with 1 uppercase, 1 lowercase, and 1 number',
  EMAIL: 'Email must be in format XXX@XXX.XXX',
  PHONE: 'Phone must be 10 digits, first digit cannot be 0',
  NAME: 'Name must be at least 2 letters',
  GATE: 'Gate is required (e.g., A12, B5)'
};

// Generic validator function
const validate = (value, pattern, errorMessage) => {
  if (!value || value.toString().trim() === '') {
    return ERROR_MESSAGES.REQUIRED;
  }
  if (pattern && !pattern.test(value.toString().trim())) {
    return errorMessage;
  }
  return null;
};

// Individual validators
export const validateBagId = (value) =>
  validate(value, PATTERNS.BAG_ID, ERROR_MESSAGES.BAG_ID);

export const validateTicketNumber = (value) =>
  validate(value, PATTERNS.TICKET_NUMBER, ERROR_MESSAGES.TICKET_NUMBER);

export const validatePassengerId = (value) =>
  validate(value, PATTERNS.PASSENGER_ID, ERROR_MESSAGES.PASSENGER_ID);

export const validateFlightNumber = (value) =>
  validate(value, PATTERNS.FLIGHT_NUMBER, ERROR_MESSAGES.FLIGHT_NUMBER);

export const validateAirlineCode = (value) =>
  validate(value, PATTERNS.AIRLINE_CODE, ERROR_MESSAGES.AIRLINE_CODE);

export const validateUsername = (value, isAdmin = false) => {
  if (!value || value.toString().trim() === '') {
    return ERROR_MESSAGES.REQUIRED;
  }
  // Admin username doesn't need to follow the pattern
  if (isAdmin) {
    return null;
  }
  if (!PATTERNS.USERNAME.test(value.toString().trim())) {
    return ERROR_MESSAGES.USERNAME;
  }
  return null;
};

export const validatePassword = (value) =>
  validate(value, PATTERNS.PASSWORD, ERROR_MESSAGES.PASSWORD);

export const validateEmail = (value) =>
  validate(value, PATTERNS.EMAIL, ERROR_MESSAGES.EMAIL);

export const validatePhone = (value) =>
  validate(value, PATTERNS.PHONE, ERROR_MESSAGES.PHONE);

export const validateName = (value) =>
  validate(value, PATTERNS.NAME, ERROR_MESSAGES.NAME);

export const validateGate = (value) => {
  if (!value || value.toString().trim() === '') {
    return ERROR_MESSAGES.REQUIRED;
  }
  // Gate can be any alphanumeric combination
  if (!/^[A-Z0-9]+$/i.test(value.toString().trim())) {
    return ERROR_MESSAGES.GATE;
  }
  return null;
};

export const validateRequired = (value, fieldName = 'This field') => {
  if (!value || value.toString().trim() === '') {
    return `${fieldName} is required`;
  }
  return null;
};

// Form validators (validate entire form)
export const validateFlightForm = (formData) => {
  const errors = {};

  errors.airline = validateAirlineCode(formData.airline);
  errors.flightNumber = validateFlightNumber(formData.flightNumber);
  errors.gate = validateGate(formData.gate);
  errors.destination = validateRequired(formData.destination, 'Destination');
  errors.departureTime = validateRequired(formData.departureTime, 'Departure time');

  return Object.fromEntries(
    Object.entries(errors).filter(([_, v]) => v !== null)
  );
};

export const validatePassengerForm = (formData) => {
  const errors = {};

  errors.name = validateName(formData.name);
  errors.passengerId = validatePassengerId(formData.passengerId);
  errors.ticketNumber = validateTicketNumber(formData.ticketNumber);
  errors.flightId = validateRequired(formData.flightId, 'Flight');
  errors.email = validateEmail(formData.email);
  errors.phone = validatePhone(formData.phone);

  return Object.fromEntries(
    Object.entries(errors).filter(([_, v]) => v !== null)
  );
};

export const validateStaffForm = (formData) => {
  const errors = {};

  errors.name = validateName(formData.name);
  errors.email = validateEmail(formData.email);
  errors.phone = validatePhone(formData.phone);
  errors.role = validateRequired(formData.role, 'Role');

  if (formData.role === 'airline_staff' || formData.role === 'gate_staff') {
    errors.airline = validateAirlineCode(formData.airline);
  }

  return Object.fromEntries(
    Object.entries(errors).filter(([_, v]) => v !== null)
  );
};

export const validateBagForm = (formData) => {
  const errors = {};

  errors.bagId = validateBagId(formData.bagId);
  errors.ticketNumber = validateTicketNumber(formData.ticketNumber);

  return Object.fromEntries(
    Object.entries(errors).filter(([_, v]) => v !== null)
  );
};

export const validateLoginForm = (formData) => {
  const errors = {};

  errors.username = validateRequired(formData.username, 'Username');
  errors.password = validateRequired(formData.password, 'Password');

  return Object.fromEntries(
    Object.entries(errors).filter(([_, v]) => v !== null)
  );
};

export const validatePassengerLoginForm = (formData) => {
  const errors = {};

  errors.passengerId = validatePassengerId(formData.passengerId);
  errors.ticketNumber = validateTicketNumber(formData.ticketNumber);

  return Object.fromEntries(
    Object.entries(errors).filter(([_, v]) => v !== null)
  );
};
