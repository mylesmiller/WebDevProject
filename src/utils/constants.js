// Role constants
export const ROLES = {
  ADMIN: 'admin',
  AIRLINE_STAFF: 'airline_staff',
  GATE_STAFF: 'gate_staff',
  GROUND_STAFF: 'ground_staff',
  PASSENGER: 'passenger'
};

// Bag location constants
export const BAG_LOCATIONS = {
  CHECK_IN: 'check-in',
  SECURITY: 'security',
  GATE: 'gate',
  LOADED: 'loaded',
  SECURITY_VIOLATION: 'security-violation'
};

// Passenger status constants
export const PASSENGER_STATUS = {
  NOT_CHECKED_IN: 'not-checked-in',
  CHECKED_IN: 'checked-in',
  BOARDED: 'boarded'
};

// Flight status constants
export const FLIGHT_STATUS = {
  SCHEDULED: 'scheduled',
  BOARDING: 'boarding',
  DEPARTED: 'departed',
  CANCELLED: 'cancelled'
};

// Message board types
export const MESSAGE_BOARDS = {
  AIRLINE: 'airline',
  GATE: 'gate',
  GROUND: 'ground'
};

// Message priorities
export const MESSAGE_PRIORITY = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high'
};

// Validation regex patterns
export const PATTERNS = {
  BAG_ID: /^\d{6}$/,
  TICKET_NUMBER: /^\d{10}$/,
  PASSENGER_ID: /^\d{6}$/,
  FLIGHT_NUMBER: /^[A-Z]{2}\d{4}$/,
  AIRLINE_CODE: /^[A-Z]{2}$/,
  USERNAME: /^[a-z]{2,}\d{2,}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[1-9]\d{9}$/,
  NAME: /^[a-zA-Z\s]{2,}$/
};

// Airlines list
export const AIRLINES = [
  { code: 'AA', name: 'American Airlines' },
  { code: 'DL', name: 'Delta Air Lines' },
  { code: 'UA', name: 'United Airlines' },
  { code: 'SW', name: 'Southwest Airlines' },
  { code: 'BA', name: 'British Airways' }
];

// Storage keys
export const STORAGE_KEYS = {
  USERS: 'users',
  FLIGHTS: 'flights',
  PASSENGERS: 'passengers',
  BAGS: 'bags',
  MESSAGES: 'messages',
  CURRENT_USER: 'currentUser'
};
