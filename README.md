# Airport Baggage Tracking System

A full-stack airport baggage tracking system with a React frontend and an Express + MySQL backend. Supports multiple staff roles, real-time bag tracking, and per-role message boards.

### Admin Dashboard
- Add/remove flights with validation
- Add/remove passengers (one ticket per passenger)
- Add/remove staff with auto-generated credentials and email delivery
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

### Passenger Dashboard
- View flight information and gate assignment
- Check boarding status
- Track bags with visual progress indicators
- View complete bag journey timeline

## Test Accounts

### Admin Account
- **Username:** admin
- **Password:** Admin123

### Airline Staff
- Alice Brown (AA): `albr01` / `Pass123`
- Bob Johnson (DL): `bojohn02` / `Pass234`

### Gate Staff
- Eve Wilson (AA): `evwi03` / `Pass789`
- Frank Davis (DL): `frda04` / `Pass890`

### Ground Staff
- Grace Taylor: `grta05` / `Pass345`
- Henry Moore: `hemo06` / `Pass456`

### Passenger Login
Login with Passenger ID + Ticket Number:
- John Smith — ID: 123456, Ticket: 1234567890
- Jane Doe — ID: 123457, Ticket: 1234567891
- Mike Johnson — ID: 234567, Ticket: 2345678901

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MySQL (local install via Homebrew or equivalent)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start MySQL:
   ```bash
   brew services start mysql
   ```

3. Seed the database (creates schema and loads test data):
   ```bash
   npm run seed
   ```

4. Start the Express backend and React frontend together:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000).

To reset all data, re-run `npm run seed` — it drops and recreates the database.

## Validation Rules

- Bag ID: 6 digits
- Ticket Number: 10 digits
- Passenger ID: 6 digits
- Flight Number: 2 uppercase letters + 4 digits (e.g., AA1234)
- Username: minimum 2 letters + minimum 2 digits (except `admin`)
- Password: minimum 6 characters, 1 uppercase, 1 lowercase, 1 number
- Email: standard `XXX@XXX.XXX` format
- Phone: 10 digits, first digit not 0
- Names: minimum 2 letters

## Business Rules

- One ticket per passenger
- Flight must exist before adding passenger
- Passenger must be checked in before boarding
- All bags must be loaded before marking flight as departed
- Passenger must be boarded before loading their bags
- Airline and gate staff see only their airline's data; ground staff see all airlines' bags
- All deletions require confirmation

## Tech Stack

- React 19 + React Router v6
- Express + MySQL (mysql2)
- bcrypt password hashing
- Nodemailer (staff credential email)
- Plain CSS

## Project Structure

```
src/                    # React frontend
├── components/
│   ├── common/         # Reusable UI components
│   ├── auth/           # Login components
│   ├── admin/          # Admin dashboard
│   ├── airline/        # Airline staff dashboard
│   ├── gate/           # Gate staff dashboard
│   ├── ground/         # Ground staff dashboard
│   └── passenger/      # Passenger dashboard
├── context/            # React Context providers
├── hooks/              # Custom React hooks
├── services/           # API client
├── utils/              # Validators and helpers
└── styles/             # CSS files

server/                 # Express + MySQL backend
├── index.js            # API entry point
├── db.js               # MySQL connection pool
├── schema.sql          # Database schema
├── seed.js             # Schema reset / seed runner
├── load-test-data.js   # Test data loader
├── mailer.js           # Credential email delivery
├── middleware/         # Auth middleware
└── routes/             # REST endpoints
```

## Available Scripts

- `npm run dev` — runs Express backend and React frontend concurrently
- `npm start` — React dev server only
- `npm run seed` — drop, recreate, and seed the MySQL database
- `npm test` — test runner
- `npm run build` — production build

## License

Educational class project.
