# Demo Instructions — Airport Bag Tracking

Everything needed to run the demo on a fresh machine or after a reset.

## 1. Prerequisites

- Node.js 18+
- MySQL running locally (e.g. `brew services start mysql`)
- A `.env` file at the project root with:
  ```
  DB_HOST=localhost
  DB_USER=root
  DB_PASSWORD=<your mysql password>
  DB_NAME=airport_bag_tracking
  SESSION_SECRET=<any random string>
  EMAIL_USER=<gmail address>
  EMAIL_APP_PASSWORD=<gmail app password>
  ```

## 2. One-time setup

```bash
brew services start mysql      # if not already running
npm install
```

## 3. Load demo data (run before every demo)

```bash
npm run seed
```

This drops and recreates the `airport_bag_tracking` database, loads all flights, passengers, bags, and staff, and **regenerates `DEMO_CREDENTIALS.txt`** with the staff usernames/passwords you'll use during the demo.

## 4. Start the app

```bash
npm run dev
```

- Backend: http://localhost:3001
- Frontend: http://localhost:3000 (opens automatically)

Stop with `Ctrl+C`.

## 5. Login credentials

Open `DEMO_CREDENTIALS.txt` (created by step 3). Key accounts:

| Role           | Username       | Password                          |
| -------------- | -------------- | --------------------------------- |
| Admin          | `admin`        | `Admin123`                        |
| Airline staff  | `richardson15` | see `DEMO_CREDENTIALS.txt` (AA)   |
| Gate staff     | `mylopolus74`  | `Demo1234` (already logged in)    |
| Ground staff   | `ramos72`      | `Demo1234` (already logged in)    |

Accounts marked `[LOGGED IN]` in `DEMO_CREDENTIALS.txt` have already had their first-login password change done — use those for the smoothest demo flow. All others will prompt to change password on first login.

## 6. Suggested demo flow

1. **Admin view** — log in as `admin / Admin123`. Show the staff management dashboard.
2. **Airline staff** — log in as `richardson15` (AA). Show flight/passenger views for AA flights.
3. **Gate staff** — log in as `mylopolus74` (AA, already logged in). Check passengers in / board them on flight `AA1360`.
4. **Ground staff** — log in as `ramos72` (already logged in). Scan/move bags between locations.

### Sample passenger lookup data

- Passenger: **Aram Shankar** — ID `654231`, ticket `1025104332`, flight `AA1360`
- Passenger: **Brian Anderson** — ID `477001`, ticket `1025542351`, flight `AA1476`

## 7. Reset between runs

If anything gets into a weird state during practice, just rerun:

```bash
npm run seed
```

This wipes and reloads everything cleanly.

## 8. Troubleshooting

- **`ER_ACCESS_DENIED`** — check `DB_PASSWORD` in `.env`.
- **Port 3000 or 3001 in use** — `lsof -ti:3000 | xargs kill` (and 3001).
- **Login fails for a named staff member** — they're probably one of the non-`[LOGGED IN]` accounts and need the first-login password change. Use a `[LOGGED IN]` account instead, or complete the change flow with `Demo1234` → new password.
- **Email features fail** — verify `EMAIL_USER` and `EMAIL_APP_PASSWORD` are set; the app uses Gmail SMTP for notifications.

## 9. Email behavior (important for the demo)

- All seeded staff use `mylesmiller2014@gmail.com` so every email goes to your inbox.
- The credentials email is sent **only when a new staff member is added by the admin** (via the admin UI), not on first-login password change.
- To demonstrate the email flow: log in as `admin`, go to staff management, add a new staff member, and check the inbox for the generated username/password.
