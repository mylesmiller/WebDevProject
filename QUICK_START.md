# Quick Start Guide — Airport Baggage Tracking System

A full-stack React + Express + MySQL app. Use this guide to run and demo it.

## Installation & Running

1. Install dependencies (only needed once):
   ```bash
   npm install
   ```

2. Start MySQL:
   ```bash
   brew services start mysql
   ```

3. Seed the database:
   ```bash
   npm run seed
   ```

4. Start backend + frontend together:
   ```bash
   npm run dev
   ```

5. Open http://localhost:3000.

To reset all data, re-run `npm run seed` (it drops and recreates the database).

## Quick Demo Script (5–10 minutes)

### 1. Admin (2 min)
```
Login: admin / Admin123
- Show overview / statistics
- Add flight: AA9999, Gate A20, Destination "San Francisco"
- Add passenger: "Demo User", ID 999999, Ticket 9999999999, on the new flight
- Add a staff member — show auto-generated credentials (also emailed)
- Logout
```

### 2. Airline Staff (2 min)
```
Login: albr01 / Pass123
- Only AA flights visible
- Search passenger by ticket: 1234567890
- Check in the passenger
- Add a bag: ID 100001
- Post an airline message
- Logout
```

### 3. Ground Staff (2 min)
```
Login: grta05 / Pass345
- All bags from all airlines visible
- Bag 100001: move Security → Gate
- View timeline
- Post a message
- Logout
```

### 4. Gate Staff (2 min)
```
Login: evwi03 / Pass789
- Pick a flight
- Bag verification blocks boarding until ready
- Board passenger (ticket 1234567890)
- Post a message
- Logout
```

### 5. Ground Staff — Load (1 min)
```
Login: grta05 / Pass345
- Bag 100001: load onto aircraft (now allowed since passenger boarded)
- Show completed timeline
- Logout
```

### 6. Passenger (1 min)
```
Passenger Login: ID 123456, Ticket 1234567890
- Flight info, gate
- Boarding status
- Bag tracking with progress bar and timeline
```

## Test Accounts Cheat Sheet

- **Admin**: `admin` / `Admin123`
- **Airline (AA)**: `albr01` / `Pass123`
- **Gate (AA)**: `evwi03` / `Pass789`
- **Ground**: `grta05` / `Pass345`
- **Passenger**: ID `123456`, Ticket `1234567890`

Full account list lives in README.md.

## Key Features

1. Role-based access (airline/gate scoped to airline; ground sees all)
2. Workflow validation (no boarding without check-in; no bag-load without boarding; one ticket per passenger)
3. Auto-generated staff credentials (shown once, emailed via Nodemailer)
4. Real-time bag tracking with timeline
5. Per-role message boards with priority levels
6. MySQL persistence — survives restarts; resettable via `npm run seed`

## Common Issues

### "Module not found"
Run `npm install`.

### Port 3000 in use
```
lsof -ti:3000 | xargs kill
# or
PORT=3001 npm start
```

### Want to reset data
Re-run `npm run seed` — it drops and recreates the MySQL database.

### MySQL connection errors
Make sure MySQL is running: `brew services start mysql`. Check `server/db.js` for connection settings.

## Validation Examples

**Flight Number** (2 letters + 4 digits): `AA1234` ✅, `A1234` ❌, `AAA1234` ❌
**Bag ID** (6 digits): `123456` ✅, `12345` ❌, `ABC123` ❌
**Password** (6+ chars, 1 upper, 1 lower, 1 number): `Pass123` ✅, `pass123` ❌, `PASS123` ❌

## Presentation Tips

1. Open multiple browser windows to show roles side-by-side
2. Show the bag timeline — visually compelling
3. Highlight auto-generated credentials with email delivery
4. Demo `npm run seed` to show clean reset
5. Walk the schema in `database-design.md` and `server/schema.sql`
