// Format date to readable string
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Format time only
export const formatTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Format date for input fields
export const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Get airline name from code
export const getAirlineName = (code) => {
  const airlines = {
    'AA': 'American Airlines',
    'DL': 'Delta Air Lines',
    'UA': 'United Airlines',
    'SW': 'Southwest Airlines',
    'BA': 'British Airways'
  };
  return airlines[code] || code;
};

// Extract airline code from flight number
export const extractAirlineCode = (flightNumber) => {
  if (!flightNumber || flightNumber.length < 2) return '';
  return flightNumber.substring(0, 2).toUpperCase();
};

// Get role display name
export const getRoleDisplayName = (role) => {
  const roleNames = {
    'admin': 'Administrator',
    'airline_staff': 'Airline Staff',
    'gate_staff': 'Gate Staff',
    'ground_staff': 'Ground Staff',
    'passenger': 'Passenger'
  };
  return roleNames[role] || role;
};

// Get bag location display name
export const getBagLocationDisplayName = (location) => {
  const locationNames = {
    'check-in': 'Check-In',
    'security': 'Security',
    'gate': 'Gate',
    'loaded': 'Loaded on Aircraft'
  };
  return locationNames[location] || location;
};

// Get passenger status display name
export const getPassengerStatusDisplayName = (status) => {
  const statusNames = {
    'not-checked-in': 'Not Checked In',
    'checked-in': 'Checked In',
    'boarded': 'Boarded'
  };
  return statusNames[status] || status;
};

// Get status color class
export const getStatusColor = (status) => {
  const colors = {
    'not-checked-in': 'status-pending',
    'checked-in': 'status-success',
    'boarded': 'status-info',
    'scheduled': 'status-pending',
    'boarding': 'status-warning',
    'departed': 'status-info',
    'cancelled': 'status-danger',
    'check-in': 'status-pending',
    'security': 'status-warning',
    'gate': 'status-success',
    'loaded': 'status-info'
  };
  return colors[status] || '';
};

// Search filter helper
export const searchFilter = (item, searchTerm, fields) => {
  if (!searchTerm) return true;

  const term = searchTerm.toLowerCase();
  return fields.some(field => {
    const value = field.split('.').reduce((obj, key) => obj?.[key], item);
    return value?.toString().toLowerCase().includes(term);
  });
};

// Sort array by field
export const sortByField = (array, field, ascending = true) => {
  return [...array].sort((a, b) => {
    const aVal = field.split('.').reduce((obj, key) => obj?.[key], a);
    const bVal = field.split('.').reduce((obj, key) => obj?.[key], b);

    if (aVal < bVal) return ascending ? -1 : 1;
    if (aVal > bVal) return ascending ? 1 : -1;
    return 0;
  });
};

// Check if date is in the past
export const isPastDate = (dateString) => {
  return new Date(dateString) < new Date();
};

// Get time until flight
export const getTimeUntilFlight = (departureTime) => {
  const now = new Date();
  const departure = new Date(departureTime);
  const diff = departure - now;

  if (diff < 0) return 'Departed';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};
