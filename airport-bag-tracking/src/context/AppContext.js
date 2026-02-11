import React, { createContext, useContext, useState } from 'react';
import { generateUsername, generatePassword } from '../utils/validation';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Initial mock data
const initialFlights = [
  { airlines: 'AA1234', airlineName: 'American Airlines', destination: 'Los Angeles, CA', gate: 'A12', ticketNumbers: ['1234567890', '1234567891'] },
  { airlines: 'DL5678', airlineName: 'Delta Air Lines', destination: 'New York, NY', gate: 'B5', ticketNumbers: ['2345678901'] },
  { airlines: 'UA9012', airlineName: 'United Airlines', destination: 'Chicago, IL', gate: 'C8', ticketNumbers: [] },
];

const initialPassengers = [
  { firstName: 'John', lastName: 'Doe', identification: '123456', ticketNumber: '1234567890', flight: 'AA1234', status: 'Checked-in' },
  { firstName: 'Jane', lastName: 'Smith', identification: '234567', ticketNumber: '1234567891', flight: 'AA1234', status: 'Not-checked-in' },
  { firstName: 'Bob', lastName: 'Johnson', identification: '345678', ticketNumber: '2345678901', flight: 'DL5678', status: 'Boarded' },
];

const initialBags = [
  { bagId: '100001', ticketNumber: '1234567890', location: { type: 'Gate', terminal: 'A', number: '12' } },
  { bagId: '100002', ticketNumber: '1234567890', location: { type: 'Security' } },
  { bagId: '100003', ticketNumber: '2345678901', location: { type: 'Loaded', flight: 'DL5678' } },
];

const initialAirlineStaff = [
  { firstName: 'Alice', lastName: 'Brown', email: 'alice@aa.com', phone: '1234567890', airlines: 'AA', username: 'albr01', password: 'Pass123', mustChangePassword: false },
  { firstName: 'Charlie', lastName: 'Davis', email: 'charlie@dl.com', phone: '2345678901', airlines: 'DL', username: 'chda02', password: 'Pass456', mustChangePassword: false },
];

const initialGateStaff = [
  { firstName: 'Eve', lastName: 'Wilson', email: 'eve@aa.com', phone: '3456789012', airlines: 'AA', username: 'evwi03', password: 'Pass789', mustChangePassword: false },
  { firstName: 'Frank', lastName: 'Miller', email: 'frank@dl.com', phone: '4567890123', airlines: 'DL', username: 'frmi04', password: 'Pass012', mustChangePassword: false },
];

const initialGroundStaff = [
  { firstName: 'Grace', lastName: 'Taylor', email: 'grace@airport.com', phone: '5678901234', username: 'grta05', password: 'Pass345', mustChangePassword: false },
  { firstName: 'Henry', lastName: 'Anderson', email: 'henry@airport.com', phone: '6789012345', username: 'hean06', password: 'Pass678', mustChangePassword: false },
];

// Message boards
const initialMessageBoards = {
  admin: [
    { id: 1, message: 'Welcome to the Administrator message board. You will receive notifications here about security violations and flight departures.', timestamp: new Date().toISOString(), author: 'System' },
  ],
  airlineStaff: [
    { id: 1, message: 'Welcome to the Airline Staff message board', timestamp: new Date().toISOString(), author: 'System' },
  ],
  gateStaff: [
    { id: 1, message: 'Welcome to the Gate Staff message board', timestamp: new Date().toISOString(), author: 'System' },
  ],
  groundStaff: [
    { id: 1, message: 'Welcome to the Ground Staff message board', timestamp: new Date().toISOString(), author: 'System' },
  ],
};

export const AppProvider = ({ children }) => {
  // Auth state
  const [currentUser, setCurrentUser] = useState(null);
  const [userType, setUserType] = useState(null);

  // Data state
  const [flights, setFlights] = useState(initialFlights);
  const [passengers, setPassengers] = useState(initialPassengers);
  const [bags, setBags] = useState(initialBags);
  const [airlineStaff, setAirlineStaff] = useState(initialAirlineStaff);
  const [gateStaff, setGateStaff] = useState(initialGateStaff);
  const [groundStaff, setGroundStaff] = useState(initialGroundStaff);
  const [messageBoards, setMessageBoards] = useState(initialMessageBoards);

  // Notifications/Alerts
  const [notifications, setNotifications] = useState([]);

  // Add notification
  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  // Authentication functions
  const login = (username, password, type) => {
    // Hard-coded admin account
    if (type === 'admin' && username === 'admin' && password === 'Admin123') {
      setCurrentUser({ username: 'admin' });
      setUserType('admin');
      return { success: true };
    }

    // Check staff accounts
    let staffList;
    switch (type) {
      case 'airlineStaff':
        staffList = airlineStaff;
        break;
      case 'gateStaff':
        staffList = gateStaff;
        break;
      case 'groundStaff':
        staffList = groundStaff;
        break;
      default:
        return { success: false, message: 'Invalid user type' };
    }

    const user = staffList.find(s => s.username === username && s.password === password);
    if (user) {
      setCurrentUser(user);
      setUserType(type);
      return { success: true, mustChangePassword: user.mustChangePassword };
    }

    return { success: false, message: 'Invalid username or password' };
  };

  // Passenger login (bonus feature)
  const passengerLogin = (identification, ticketNumber) => {
    const passenger = passengers.find(
      p => p.identification === identification && p.ticketNumber === ticketNumber
    );
    if (passenger) {
      setCurrentUser(passenger);
      setUserType('passenger');
      return { success: true };
    }
    return { success: false, message: 'Invalid identification or ticket number' };
  };

  const logout = () => {
    setCurrentUser(null);
    setUserType(null);
  };

  const changePassword = (newPassword) => {
    if (!currentUser || userType === 'admin' || userType === 'passenger') return false;

    const updateStaff = (list, setList) => {
      const updated = list.map(s =>
        s.username === currentUser.username
          ? { ...s, password: newPassword, mustChangePassword: false }
          : s
      );
      setList(updated);
      setCurrentUser({ ...currentUser, password: newPassword, mustChangePassword: false });
    };

    switch (userType) {
      case 'airlineStaff':
        updateStaff(airlineStaff, setAirlineStaff);
        break;
      case 'gateStaff':
        updateStaff(gateStaff, setGateStaff);
        break;
      case 'groundStaff':
        updateStaff(groundStaff, setGroundStaff);
        break;
      default:
        return false;
    }
    return true;
  };

  // Flight functions
  const addFlight = (flight) => {
    if (flights.find(f => f.airlines === flight.airlines)) {
      return { success: false, message: 'Flight already exists' };
    }
    if (flights.find(f => f.gate === flight.gate)) {
      return { success: false, message: 'Gate is already occupied by another flight' };
    }
    setFlights([...flights, { ...flight, ticketNumbers: [] }]);
    addNotification(`Flight ${flight.airlines} added successfully`, 'success');
    return { success: true };
  };

  const removeFlight = (airlines) => {
    // Remove all passengers and bags for this flight
    const flightPassengers = passengers.filter(p => p.flight === airlines);
    const passengerTickets = flightPassengers.map(p => p.ticketNumber);

    setPassengers(passengers.filter(p => p.flight !== airlines));
    setBags(bags.filter(b => !passengerTickets.includes(b.ticketNumber)));
    setFlights(flights.filter(f => f.airlines !== airlines));

    addNotification(`Flight ${airlines} and all associated data removed`, 'success');
    return { success: true };
  };

  // Passenger functions
  const addPassenger = (passenger) => {
    if (passengers.find(p => p.identification === passenger.identification)) {
      return { success: false, message: 'Passenger already exists in the system' };
    }
    if (!flights.find(f => f.airlines === passenger.flight)) {
      return { success: false, message: 'Flight does not exist' };
    }

    const newPassenger = { ...passenger, status: 'Not-checked-in' };
    setPassengers([...passengers, newPassenger]);

    // Add ticket to flight
    setFlights(flights.map(f =>
      f.airlines === passenger.flight
        ? { ...f, ticketNumbers: [...f.ticketNumbers, passenger.ticketNumber] }
        : f
    ));

    addNotification(`Passenger ${passenger.firstName} ${passenger.lastName} added successfully`, 'success');
    return { success: true };
  };

  const removePassenger = (ticketNumber) => {
    const passenger = passengers.find(p => p.ticketNumber === ticketNumber);
    if (!passenger) return { success: false, message: 'Passenger not found' };

    // Remove bags
    setBags(bags.filter(b => b.ticketNumber !== ticketNumber));

    // Remove from flight
    setFlights(flights.map(f => ({
      ...f,
      ticketNumbers: f.ticketNumbers.filter(t => t !== ticketNumber)
    })));

    // Remove passenger
    setPassengers(passengers.filter(p => p.ticketNumber !== ticketNumber));

    addNotification(`Passenger ${passenger.firstName} ${passenger.lastName} removed`, 'success');
    return { success: true };
  };

  // Staff functions
  const addStaff = (type, staffData) => {
    const username = generateUsername(staffData.firstName, staffData.lastName);
    const password = generatePassword();
    const newStaff = { ...staffData, username, password, mustChangePassword: true };

    switch (type) {
      case 'airlineStaff':
        setAirlineStaff([...airlineStaff, newStaff]);
        break;
      case 'gateStaff':
        setGateStaff([...gateStaff, newStaff]);
        break;
      case 'groundStaff':
        const { airlines, ...groundData } = newStaff;
        setGroundStaff([...groundStaff, groundData]);
        break;
      default:
        return { success: false, message: 'Invalid staff type' };
    }

    addNotification(`Staff member added. Username: ${username}, Password: ${password}`, 'success');
    return { success: true, username, password };
  };

  const removeStaff = (type, username) => {
    switch (type) {
      case 'airlineStaff':
        setAirlineStaff(airlineStaff.filter(s => s.username !== username));
        break;
      case 'gateStaff':
        setGateStaff(gateStaff.filter(s => s.username !== username));
        break;
      case 'groundStaff':
        setGroundStaff(groundStaff.filter(s => s.username !== username));
        break;
      default:
        return { success: false, message: 'Invalid staff type' };
    }
    addNotification(`Staff member ${username} removed`, 'success');
    return { success: true };
  };

  // Check-in function (Airline Staff)
  const checkInPassenger = (ticketNumber, bagCount) => {
    const passenger = passengers.find(p => p.ticketNumber === ticketNumber);
    if (!passenger) return { success: false, message: 'Passenger not found' };
    if (!flights.find(f => f.airlines === passenger.flight)) {
      return { success: false, message: 'Flight not found' };
    }

    // Update passenger status
    setPassengers(passengers.map(p =>
      p.ticketNumber === ticketNumber ? { ...p, status: 'Checked-in' } : p
    ));

    // Create bags
    const newBags = [];
    for (let i = 0; i < bagCount; i++) {
      const bagId = String(100000 + bags.length + i + 1);
      newBags.push({
        bagId,
        ticketNumber,
        location: { type: 'Check-in', terminal: 'A', counter: '1' }
      });
    }
    setBags([...bags, ...newBags]);

    addNotification(`Passenger checked in with ${bagCount} bag(s)`, 'success');
    return { success: true, bags: newBags };
  };

  // Board passenger (Gate Staff)
  const boardPassenger = (ticketNumber) => {
    const passenger = passengers.find(p => p.ticketNumber === ticketNumber);
    if (!passenger) return { success: false, message: 'Passenger not found' };
    if (passenger.status !== 'Checked-in') {
      return { success: false, message: 'Passenger must be checked in first' };
    }

    // Check if all bags are at gate (not loaded yet - passenger must board first)
    const passengerBags = bags.filter(b => b.ticketNumber === ticketNumber);
    const allBagsAtGate = passengerBags.every(b =>
      b.location.type === 'Gate'
    );
    if (!allBagsAtGate && passengerBags.length > 0) {
      return { success: false, message: 'Not all bags have cleared security and reached the gate' };
    }

    setPassengers(passengers.map(p =>
      p.ticketNumber === ticketNumber ? { ...p, status: 'Boarded' } : p
    ));

    addNotification(`Passenger ${passenger.firstName} ${passenger.lastName} boarded`, 'success');
    return { success: true };
  };

  // Update bag location (Ground Staff)
  const updateBagLocation = (bagId, newLocation) => {
    setBags(bags.map(b =>
      b.bagId === bagId ? { ...b, location: newLocation } : b
    ));
    addNotification(`Bag ${bagId} location updated`, 'success');
    return { success: true };
  };

  // Load bag (Ground Staff)
  const loadBag = (bagId) => {
    const bag = bags.find(b => b.bagId === bagId);
    if (!bag) return { success: false, message: 'Bag not found' };

    const passenger = passengers.find(p => p.ticketNumber === bag.ticketNumber);
    if (!passenger || passenger.status !== 'Boarded') {
      return { success: false, message: 'Passenger must be boarded first' };
    }

    setBags(bags.map(b =>
      b.bagId === bagId ? { ...b, location: { type: 'Loaded', flight: passenger.flight } } : b
    ));

    addNotification(`Bag ${bagId} loaded onto ${passenger.flight}`, 'success');
    return { success: true };
  };

  // Message board functions
  const addMessage = (boardType, message, author) => {
    const newMessage = {
      id: Date.now(),
      message,
      author,
      timestamp: new Date().toISOString()
    };
    setMessageBoards(prev => ({
      ...prev,
      [boardType]: [...prev[boardType], newMessage]
    }));
  };

  // Report security violation
  const reportSecurityViolation = (bagId, reason) => {
    const bag = bags.find(b => b.bagId === bagId);
    if (!bag) return { success: false, message: 'Bag not found' };

    const passenger = passengers.find(p => p.ticketNumber === bag.ticketNumber);

    // Add to airline staff message board
    addMessage('airlineStaff',
      `SECURITY VIOLATION: Bag ${bagId} belonging to ${passenger?.firstName} ${passenger?.lastName} (Ticket: ${bag.ticketNumber}). Reason: ${reason}`,
      'Ground Staff'
    );

    addNotification('Security violation reported to Airline Staff', 'warning');
    return { success: true };
  };

  // Notify admin to remove passenger (called by airline staff after seeing security violation)
  const notifyAdminToRemovePassenger = (ticketNumber, reason) => {
    const passenger = passengers.find(p => p.ticketNumber === ticketNumber);
    if (!passenger) return { success: false, message: 'Passenger not found' };

    // Add message to admin board
    addMessage('admin',
      `ACTION REQUIRED: Please remove passenger ${passenger.firstName} ${passenger.lastName} (Ticket: ${ticketNumber}, Flight: ${passenger.flight}). Reason: ${reason}`,
      `Airline Staff`
    );

    addNotification('Administrator has been notified to remove the passenger', 'info');
    return { success: true };
  };

  // Notify admin about ready flight
  const notifyFlightReady = (airlines) => {
    const flight = flights.find(f => f.airlines === airlines);
    if (!flight) return { success: false, message: 'Flight not found' };

    // Check all passengers boarded
    const flightPassengers = passengers.filter(p => p.flight === airlines);
    const allBoarded = flightPassengers.every(p => p.status === 'Boarded');
    if (!allBoarded) {
      return { success: false, message: 'Not all passengers have boarded' };
    }

    // Check all bags loaded
    const passengerTickets = flightPassengers.map(p => p.ticketNumber);
    const flightBags = bags.filter(b => passengerTickets.includes(b.ticketNumber));
    const allLoaded = flightBags.every(b => b.location.type === 'Loaded');
    if (!allLoaded) {
      return { success: false, message: 'Not all bags have been loaded' };
    }

    // Send message to admin
    addMessage('admin',
      `FLIGHT READY: Flight ${airlines} to ${flight.destination} at Gate ${flight.gate} is ready for departure. All ${flightPassengers.length} passengers boarded and ${flightBags.length} bags loaded. You may now remove this flight from the system.`,
      'Gate Staff'
    );

    addNotification(`Flight ${airlines} is ready for departure. Admin notified.`, 'success');
    return { success: true };
  };

  // Update gate (bonus)
  const updateGate = (airlines, newGate) => {
    setFlights(flights.map(f =>
      f.airlines === airlines ? { ...f, gate: newGate } : f
    ));

    // Notify ground staff
    addMessage('groundStaff',
      `GATE CHANGE: Flight ${airlines} moved to gate ${newGate}`,
      'Gate Staff'
    );

    addNotification(`Gate updated for flight ${airlines}`, 'success');
    return { success: true };
  };

  const value = {
    // Auth
    currentUser,
    userType,
    login,
    passengerLogin,
    logout,
    changePassword,

    // Data
    flights,
    passengers,
    bags,
    airlineStaff,
    gateStaff,
    groundStaff,
    messageBoards,
    notifications,

    // Functions
    addNotification,
    addFlight,
    removeFlight,
    addPassenger,
    removePassenger,
    addStaff,
    removeStaff,
    checkInPassenger,
    boardPassenger,
    updateBagLocation,
    loadBag,
    addMessage,
    reportSecurityViolation,
    notifyAdminToRemovePassenger,
    notifyFlightReady,
    updateGate,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext;
