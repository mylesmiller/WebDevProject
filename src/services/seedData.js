import { ROLES, PASSENGER_STATUS, BAG_LOCATIONS, FLIGHT_STATUS } from '../utils/constants';
import { hashPassword } from '../utils/encryption';

// Seed data for testing
export const seedData = {
  users: {
    'admin_001': {
      id: 'admin_001',
      username: 'admin',
      password: hashPassword('Admin123'),
      role: ROLES.ADMIN,
      name: 'System Administrator',
      email: 'admin@airport.com',
      phone: '5551234567',
      mustChangePassword: false
    },
    'airline_001': {
      id: 'airline_001',
      username: 'albr01',
      password: hashPassword('Pass123'),
      role: ROLES.AIRLINE_STAFF,
      name: 'Alice Brown',
      email: 'alice.brown@aa.com',
      phone: '5552345678',
      airline: 'AA',
      mustChangePassword: false
    },
    'airline_002': {
      id: 'airline_002',
      username: 'bojohn02',
      password: hashPassword('Pass234'),
      role: ROLES.AIRLINE_STAFF,
      name: 'Bob Johnson',
      email: 'bob.johnson@delta.com',
      phone: '5553456789',
      airline: 'DL',
      mustChangePassword: false
    },
    'gate_001': {
      id: 'gate_001',
      username: 'evwi03',
      password: hashPassword('Pass789'),
      role: ROLES.GATE_STAFF,
      name: 'Eve Wilson',
      email: 'eve.wilson@aa.com',
      phone: '5554567890',
      airline: 'AA',
      mustChangePassword: false
    },
    'gate_002': {
      id: 'gate_002',
      username: 'frda04',
      password: hashPassword('Pass890'),
      role: ROLES.GATE_STAFF,
      name: 'Frank Davis',
      email: 'frank.davis@delta.com',
      phone: '5555678901',
      airline: 'DL',
      mustChangePassword: false
    },
    'ground_001': {
      id: 'ground_001',
      username: 'grta05',
      password: hashPassword('Pass345'),
      role: ROLES.GROUND_STAFF,
      name: 'Grace Taylor',
      email: 'grace.taylor@airport.com',
      phone: '5556789012',
      mustChangePassword: false
    },
    'ground_002': {
      id: 'ground_002',
      username: 'hemo06',
      password: hashPassword('Pass456'),
      role: ROLES.GROUND_STAFF,
      name: 'Henry Moore',
      email: 'henry.moore@airport.com',
      phone: '5557890123',
      mustChangePassword: false
    }
  },

  flights: {
    'AA1234_flight1': {
      id: 'AA1234_flight1',
      airline: 'AA',
      flightNumber: 'AA1234',
      gate: 'A12',
      destination: 'New York (JFK)',
      departureTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // 3 hours from now
      status: FLIGHT_STATUS.SCHEDULED,
      passengerIds: ['123456', '123457']
    },
    'DL5678_flight2': {
      id: 'DL5678_flight2',
      airline: 'DL',
      flightNumber: 'DL5678',
      gate: 'B5',
      destination: 'Los Angeles (LAX)',
      departureTime: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(), // 5 hours from now
      status: FLIGHT_STATUS.SCHEDULED,
      passengerIds: ['234567']
    },
    'UA9012_flight3': {
      id: 'UA9012_flight3',
      airline: 'UA',
      flightNumber: 'UA9012',
      gate: 'C3',
      destination: 'Chicago (ORD)',
      departureTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
      status: FLIGHT_STATUS.SCHEDULED,
      passengerIds: []
    }
  },

  passengers: {
    '123456': {
      id: '123456',
      name: 'John Smith',
      ticketNumber: '1234567890',
      flightId: 'AA1234_flight1',
      status: PASSENGER_STATUS.NOT_CHECKED_IN,
      email: 'john.smith@email.com',
      phone: '5551111111',
      bagIds: [],
      checkedInAt: null,
      checkedInBy: null,
      boardedAt: null,
      boardedBy: null
    },
    '123457': {
      id: '123457',
      name: 'Jane Doe',
      ticketNumber: '1234567891',
      flightId: 'AA1234_flight1',
      status: PASSENGER_STATUS.NOT_CHECKED_IN,
      email: 'jane.doe@email.com',
      phone: '5552222222',
      bagIds: [],
      checkedInAt: null,
      checkedInBy: null,
      boardedAt: null,
      boardedBy: null
    },
    '234567': {
      id: '234567',
      name: 'Mike Johnson',
      ticketNumber: '2345678901',
      flightId: 'DL5678_flight2',
      status: PASSENGER_STATUS.NOT_CHECKED_IN,
      email: 'mike.j@email.com',
      phone: '5553333333',
      bagIds: [],
      checkedInAt: null,
      checkedInBy: null,
      boardedAt: null,
      boardedBy: null
    }
  },

  bags: {},

  messages: {
    airline: [],
    gate: [],
    ground: []
  }
};

export default seedData;
