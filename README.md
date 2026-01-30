# Airport Baggage Tracking System

A comprehensive frontend-only React application for managing airport baggage operations with multiple user roles, real-time tracking, and message board communications.

## Overview

This application simulates a complete airport baggage handling system with:
- 5 distinct user roles (Admin, Airline Staff, Gate Staff, Ground Staff, Passenger)
- Complete baggage workflow from check-in to aircraft loading
- Real-time bag tracking with timeline visualization
- Role-specific message boards for staff communication
- Data persistence using localStorage
- All validation rules enforced

**Note:** This is a class project for educational purposes. It uses frontend-only data storage (localStorage) and should not be used in production environments.

## Features

### Admin Dashboard
- Add/remove flights with validation
- Add/remove passengers (one ticket per passenger)
- Add/remove staff with auto-generated credentials
- View system statistics and all data

### Airline Staff Dashboard
- View only their airline's flights
- Check in passengers and create bag entries
- Post and view airline-specific messages

### Gate Staff Dashboard
- View only their airline's flights
- Verify all bags are loaded before boarding
- Board checked-in passengers
- Update flight status
- Post and view gate-specific messages

### Ground Staff Dashboard
- View bags from ALL airlines
- Move bags through security checkpoints
- Move bags to gates
- Load bags onto aircraft (after passenger boarding verification)
- Post and view ground staff messages

### Passenger Dashboard (Bonus Feature)
- View flight information and gate assignment
- Check boarding status
- Track bags with visual progress indicators
- View complete bag journey timeline

## Test Accounts

### Admin Account
- **Username:** admin
- **Password:** Admin123
- **Access:** Full system administration

### Airline Staff
- **Alice Brown (American Airlines - AA)**
  - Username: albr01
  - Password: Pass123
  - Access: AA flights only

- **Bob Johnson (Delta Air Lines - DL)**
  - Username: bojohn02
  - Password: Pass234
  - Access: DL flights only

### Gate Staff
- **Eve Wilson (American Airlines - AA)**
  - Username: evwi03
  - Password: Pass789
  - Access: AA flights only

- **Frank Davis (Delta Air Lines - DL)**
  - Username: frda04
  - Password: Pass890
  - Access: DL flights only

### Ground Staff
- **Grace Taylor**
  - Username: grta05
  - Password: Pass345
  - Access: All airlines' bags

- **Henry Moore**
  - Username: hemo06
  - Password: Pass456
  - Access: All airlines' bags

### Passenger Login
Login using Passenger ID + Ticket Number:
- **John Smith:** ID: 123456, Ticket: 1234567890
- **Jane Doe:** ID: 123457, Ticket: 1234567891
- **Mike Johnson:** ID: 234567, Ticket: 2345678901

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage Walkthrough

### Complete Workflow Example

1. **Admin Setup**
   - Login as admin (admin / Admin123)
   - Add a new flight (e.g., AA1234, gate A12, destination "New York")
   - Add a passenger (John Doe, ID 123456, ticket 1234567890) to the flight
   - Add airline staff if needed
   - Logout

2. **Airline Staff Check-In**
   - Login as airline staff (albr01 / Pass123)
   - Search for passenger by ticket number (1234567890)
   - Check in the passenger
   - Create bag entries (e.g., bag ID 100001)
   - View passengers on your flights
   - Post message to airline board
   - Logout

3. **Ground Staff Bag Handling**
   - Login as ground staff (grta05 / Pass345)
   - Find the bag (100001)
   - Move bag to security
   - Move bag to gate
   - (Wait for passenger to board first)
   - Post message to ground board
   - Logout

4. **Gate Staff Boarding**
   - Login as gate staff (evwi03 / Pass789)
   - Select the flight
   - Verify bags are at gate (not loaded yet)
   - Board the passenger (John Doe)
   - Post message to gate board
   - Logout

5. **Ground Staff Load Bags**
   - Login as ground staff again
   - Find bag 100001
   - Load onto aircraft (now allowed since passenger is boarded)
   - Logout

6. **Gate Staff Complete Boarding**
   - Login as gate staff
   - Verify all bags loaded
   - Mark flight as departed
   - Logout

7. **Passenger Tracking**
   - Login as passenger (ID: 123456, Ticket: 1234567890)
   - View flight information
   - View boarding status
   - Track bag location with timeline
   - See complete bag journey

## Validation Rules

The system enforces all specified validation rules:
- Bag ID: Exactly 6 digits
- Ticket Number: Exactly 10 digits
- Passenger ID: Exactly 6 digits
- Flight Number: 2 uppercase letters + 4 digits (e.g., AA1234)
- Username: Minimum 2 letters + minimum 2 digits (except admin)
- Password: Minimum 6 characters, 1 uppercase, 1 lowercase, 1 number
- Email: XXX@XXX.XXX format
- Phone: 10 digits, first digit cannot be 0
- Names: Minimum 2 letters

## Business Rules

- One ticket per passenger (enforced)
- Flight must exist before adding passenger
- Passenger must be checked-in before boarding
- All bags must be loaded before marking flight as departed
- Passenger must be boarded before loading their bags
- Airline staff see only their airline's data
- Ground staff see all airlines' bags
- All deletions require confirmation

## Data Persistence

Data is stored in browser localStorage and persists across:
- Page refreshes
- Browser restarts
- Multiple tabs (synchronized)

To reset data to initial state, clear browser localStorage or use browser dev tools.

## Security Note

This is a frontend-only educational project. All data is stored in browser localStorage, which is:
- Accessible to anyone with browser access
- Not encrypted in storage
- Not suitable for real-world use
- Passwords are hashed using SHA256 for demonstration only

## Tech Stack

- React 19.2.4
- React Router v6
- crypto-js (password hashing)
- Plain CSS (no frameworks)
- localStorage (data persistence)

## Project Structure

```
src/
├── components/
│   ├── common/          # Reusable UI components
│   ├── auth/            # Login components
│   ├── admin/           # Admin dashboard
│   ├── airline/         # Airline staff dashboard
│   ├── gate/            # Gate staff dashboard
│   ├── ground/          # Ground staff dashboard
│   └── passenger/       # Passenger dashboard
├── context/             # React Context providers
├── hooks/               # Custom React hooks
├── services/            # Data services
├── utils/               # Utilities and validators
└── styles/              # CSS files
```

## Available Scripts

### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### `npm test`
Launches the test runner

### `npm run build`
Builds the app for production to the `build` folder

## License

This project is created for educational purposes as a class project.