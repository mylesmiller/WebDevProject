const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const express = require('express');
const session = require('express-session');
const pool = require('./db');

const authRoutes = require('./routes/auth');
const flightRoutes = require('./routes/flights');
const passengerRoutes = require('./routes/passengers');
const bagRoutes = require('./routes/bags');
const messageRoutes = require('./routes/messages');
const staffRoutes = require('./routes/staff');

const app = express();
const PORT = 3001;

app.use(express.json());

app.use(session({
  secret: 'airport-ops-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/passengers', passengerRoutes);
app.use('/api/bags', bagRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/staff', staffRoutes);

// Serve React build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
