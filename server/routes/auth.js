const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Staff login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const [users] = await pool.query(
      'SELECT u.*, uc.password_hash, uc.must_change_password FROM user u JOIN user_credentials uc ON u.username = uc.username WHERE u.username = ?',
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = users[0];
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const sessionUser = {
      id: user.id,
      username: user.username,
      role: user.role,
      name: user.firstname + ' ' + user.lastname,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      phone: user.phone,
      airline: user.airline,
      mustChangePassword: !!user.must_change_password
    };

    req.session.user = sessionUser;
    res.json(sessionUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Passenger login
router.post('/login-passenger', async (req, res) => {
  try {
    const { passengerId, ticketNumber } = req.body;

    const [passengers] = await pool.query(
      'SELECT * FROM passenger WHERE id = ? AND ticket_number = ?',
      [passengerId, ticketNumber]
    );

    if (passengers.length === 0) {
      return res.status(401).json({ error: 'Invalid passenger ID or ticket number' });
    }

    const passenger = passengers[0];

    const sessionUser = {
      id: passenger.id,
      role: 'passenger',
      name: passenger.firstname + ' ' + passenger.lastname,
      firstname: passenger.firstname,
      lastname: passenger.lastname,
      ticketNumber: passenger.ticket_number,
      flightId: passenger.flight_id,
      passengerId: passenger.id
    };

    req.session.user = sessionUser;
    res.json(sessionUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ message: 'Logged out' });
  });
});

// Get current session
router.get('/me', (req, res) => {
  if (req.session && req.session.user) {
    return res.json(req.session.user);
  }
  res.status(401).json({ error: 'Not authenticated' });
});

// Change password
router.put('/change-password', requireAuth, async (req, res) => {
  try {
    const { newPassword } = req.body;
    const userId = req.session.user.id;

    // Get user's username
    const [users] = await pool.query('SELECT username FROM user WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query(
      'UPDATE user_credentials SET password_hash = ?, must_change_password = 0 WHERE username = ?',
      [hash, users[0].username]
    );

    req.session.user.mustChangePassword = false;
    res.json({ message: 'Password changed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
