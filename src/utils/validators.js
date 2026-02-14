import { PATTERNS } from './constants';

// Validation error messages
const ERROR_MESSAGES = {
  REQUIRED: 'This field is required',
  BAG_ID: 'Bag ID must be exactly 6 digits',
  TICKET_NUMBER: 'Ticket number must be exactly 10 digits',
  PASSENGER_ID: 'Passenger ID must be exactly 6 digits',
  FLIGHT_NUMBER: 'Flight number must be 2 uppercase letters followed by 4 digits (e.g., AA1234)',
  AIRLINE_CODE: 'Airline code must be 2 uppercase letters',
  USERNAME: 'Username must be formed using lastname and two digits (e.g., smith01)',
  PASSWORD: 'Password must be at least 6 characters with 1 uppercase, 1 lowercase, and 1 number',
  EMAIL: 'Email must be in format XXXX@XXX.XX (e.g., john@email.com)',
  PHONE: 'Phone number must be exactly 10 digits',
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

// Optional email validator - only validates format if value is provided
export const validateEmailOptional = (value) => {
  if (!value || value.toString().trim() === '') {
    return null; // Optional, so empty is OK
  }
  if (!PATTERNS.EMAIL.test(value.toString().trim())) {
    return ERROR_MESSAGES.EMAIL;
  }
  return null;
};

export const validatePhone = (value) =>
  validate(value, PATTERNS.PHONE, ERROR_MESSAGES.PHONE);

// Optional phone validator - only validates format if value is provided
export const validatePhoneOptional = (value) => {
  if (!value || value.toString().trim() === '') {
    return null; // Optional, so empty is OK
  }
  if (!PATTERNS.PHONE.test(value.toString().trim())) {
    return ERROR_MESSAGES.PHONE;
  }
  return null;
};

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

  const flightNumError = validateFlightNumber(formData.flightNumber);
  if (flightNumError) errors.flightNumber = flightNumError;

  const gateError = validateGate(formData.gate);
  if (gateError) errors.gate = gateError;

  // Destination is required
  const destError = validateRequired(formData.destination, 'Destination');
  if (destError) errors.destination = destError;

  // Departure time is required
  const timeError = validateRequired(formData.departureTime, 'Departure time');
  if (timeError) errors.departureTime = timeError;

  return errors;
};

export const validatePassengerForm = (formData) => {
  const errors = {};

  const nameError = validateName(formData.name);
  if (nameError) errors.name = nameError;

  const idError = validatePassengerId(formData.passengerId);
  if (idError) errors.passengerId = idError;

  const ticketError = validateTicketNumber(formData.ticketNumber);
  if (ticketError) errors.ticketNumber = ticketError;

  const flightError = validateRequired(formData.flightId, 'Flight');
  if (flightError) errors.flightId = flightError;

  // Validate email if provided (optional field)
  const emailError = validateEmailOptional(formData.email);
  if (emailError) errors.email = emailError;

  // Validate phone if provided (optional field)
  const phoneError = validatePhoneOptional(formData.phone);
  if (phoneError) errors.phone = phoneError;

  return errors;
};

export const validateStaffForm = (formData) => {
  const errors = {};

  const nameError = validateName(formData.name);
  if (nameError) errors.name = nameError;

  const roleError = validateRequired(formData.role, 'Role');
  if (roleError) errors.role = roleError;

  const emailError = validateEmail(formData.email);
  if (emailError) errors.email = emailError;

  const phoneError = validatePhone(formData.phone);
  if (phoneError) errors.phone = phoneError;

  if (formData.role === 'airline_staff' || formData.role === 'gate_staff') {
    const airlineError = validateRequired(formData.airline, 'Airline');
    if (airlineError) errors.airline = airlineError;
  }

  return errors;
};

export const validateBagForm = (formData) => {
  const errors = {};

  const bagError = validateBagId(formData.bagId);
  if (bagError) errors.bagId = bagError;

  const ticketError = validateTicketNumber(formData.ticketNumber);
  if (ticketError) errors.ticketNumber = ticketError;

  return errors;
};

export const validateLoginForm = (formData) => {
  const errors = {};

  if (!formData.username || formData.username.trim() === '') {
    errors.username = 'Username is required';
  }

  if (!formData.password || formData.password.trim() === '') {
    errors.password = 'Password is required';
  }

  return errors;
};

export const validatePassengerLoginForm = (formData) => {
  const errors = {};

  const idError = validatePassengerId(formData.passengerId);
  if (idError) errors.passengerId = idError;

  const ticketError = validateTicketNumber(formData.ticketNumber);
  if (ticketError) errors.ticketNumber = ticketError;

  return errors;
};
