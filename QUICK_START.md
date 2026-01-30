# Quick Start Guide - Airport Baggage Tracking System

## For Your Class Project Submission

This is a complete, working airport baggage tracking system built with React. Here's everything you need to know to run and demo it.

## Installation & Running

1. **Install dependencies** (only needed once):
```bash
npm install
```

2. **Start the application**:
```bash
npm start
```

3. The app will open in your browser at http://localhost:3000

## Quick Demo Script (5-10 minutes)

Follow this script to demonstrate all features:

### 1. Admin Demo (2 minutes)
```
Login: admin / Admin123
- Show the overview page (statistics)
- Add a new flight: AA9999, Gate A20, Destination "San Francisco"
- Add a passenger: Name "Demo User", ID 999999, Ticket 9999999999, select the flight
- Add a staff member (any role) - show auto-generated credentials
- Logout
```

### 2. Airline Staff Demo (2 minutes)
```
Login: albr01 / Pass123
- Show that only AA flights are visible
- Search for passenger by ticket: 1234567890
- Check in the passenger
- Add a bag: ID 100001
- Post a message to airline board
- Logout
```

### 3. Ground Staff Demo (2 minutes)
```
Login: grta05 / Pass345
- Show all bags from all airlines
- Select bag 100001
- Move it through: Security → Gate
- Show timeline
- Post a message
- Logout
```

### 4. Gate Staff Demo (2 minutes)
```
Login: evwi03 / Pass789
- Select a flight
- Show that bag verification prevents boarding
- Board a checked-in passenger (ticket 1234567890)
- Post a message
- Logout
```

### 5. Ground Staff - Complete Workflow (1 minute)
```
Login: grta05 / Pass345
- Find bag 100001
- Now that passenger is boarded, load bag onto aircraft
- Show completed timeline
- Logout
```

### 6. Passenger Demo (1 minute)
```
Go to Passenger Login
Enter: ID 123456, Ticket 1234567890
- Show flight info and gate
- Show boarding status
- Show bag tracking with visual progress bar
- Show complete bag timeline
```

## Test Accounts Cheat Sheet

### Quick Access Accounts
- **Admin**: admin / Admin123
- **Airline (AA)**: albr01 / Pass123
- **Gate (AA)**: evwi03 / Pass789
- **Ground**: grta05 / Pass345
- **Passenger**: ID 123456, Ticket 1234567890

### All Available Accounts
See README.md for complete list of test accounts.

## Key Features to Highlight

1. **Role-Based Access Control**
   - Each role sees only what they should see
   - Airline staff see only their airline
   - Ground staff see all airlines

2. **Workflow Validation**
   - Can't board without checking in
   - Can't load bags without passenger boarding
   - One ticket per passenger enforced

3. **Auto-Generated Credentials**
   - Admin adds staff, system generates secure credentials
   - Shown only once for security

4. **Real-Time Bag Tracking**
   - Passengers can see exactly where their bags are
   - Complete timeline of bag movement
   - Visual progress indicator

5. **Message Boards**
   - Role-specific communication
   - Priority levels
   - Timestamped messages

6. **Data Persistence**
   - All data saved in browser
   - Works across page refreshes
   - Can demo by refreshing page

## Common Issues & Solutions

### Issue: "Module not found"
**Solution**: Run `npm install` again

### Issue: Port 3000 already in use
**Solution**:
- Kill other processes: `lsof -ti:3000 | xargs kill`
- Or use different port: `PORT=3001 npm start`

### Issue: Want to reset data
**Solution**:
- Open browser DevTools (F12)
- Go to Application tab → Local Storage
- Delete all items
- Refresh page

### Issue: Forgot test account credentials
**Solution**: Check README.md or QUICK_START.md

## File Structure for Reference

```
src/
├── components/       # All UI components
│   ├── admin/       # Admin dashboard
│   ├── airline/     # Airline staff dashboard
│   ├── gate/        # Gate staff dashboard
│   ├── ground/      # Ground staff dashboard
│   ├── passenger/   # Passenger dashboard
│   ├── auth/        # Login components
│   └── common/      # Reusable components
├── context/         # State management
├── hooks/           # Custom React hooks
├── services/        # Data services
├── utils/           # Validation & helpers
└── styles/          # CSS files
```

## Validation Examples

The system validates all inputs. Try these to see validation in action:

**Flight Number**: Must be 2 letters + 4 digits
- ✅ AA1234
- ❌ A1234 (too short)
- ❌ AAA1234 (too long)

**Bag ID**: Must be 6 digits
- ✅ 123456
- ❌ 12345 (too short)
- ❌ ABC123 (contains letters)

**Password**: 6+ chars, 1 upper, 1 lower, 1 number
- ✅ Pass123
- ❌ pass123 (no uppercase)
- ❌ PASS123 (no lowercase)
- ❌ Password (no number)

## Presentation Tips

1. **Start with Overview**: Show README.md to explain the project
2. **Live Demo**: Follow the demo script above
3. **Show Code**: Highlight key files like validators.js or BagContext.js
4. **Explain Architecture**: Use AppProviders.js to show state management
5. **Show Business Logic**: Demonstrate bag loading validation (can't load until passenger boards)

## What Makes This Project Stand Out

1. **Complete Implementation**: All 7 user roles, all workflows
2. **Production-Quality Code**: Proper validation, error handling, confirmations
3. **User Experience**: Clean UI, real-time feedback, intuitive navigation
4. **Security Awareness**: Acknowledges frontend limitations, encrypts passwords
5. **Documentation**: Comprehensive README and implementation summary

## Need Help?

- Check README.md for complete documentation
- Check IMPLEMENTATION_SUMMARY.md for technical details
- All validation rules are in src/utils/validators.js
- All business logic is in src/context/ files

## Pro Tips

1. Open multiple browser windows to show different roles simultaneously
2. Use browser DevTools to show localStorage data persistence
3. Demonstrate mobile responsiveness by resizing browser
4. Show the bag timeline feature - it's visually impressive!
5. Point out the auto-generated username/password feature

Good luck with your class presentation! 🚀
