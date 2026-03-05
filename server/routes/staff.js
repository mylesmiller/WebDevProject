const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

function formatStaff(u) {
  return {
    ...u,
    name: u.firstname + ' ' + u.lastname
  };
}

// Get all staff
router.get('/', async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, username, role, firstname, lastname, email, phone, airline FROM user');
    res.json(users.map(formatStaff));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get staff by ID
router.get('/:id', async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, username, role, firstname, lastname, email, phone, airline FROM user WHERE id = ?',
      [req.params.id]
    );
    if (users.length === 0) {
      return res.status(404).json({ error: 'Staff not found' });
    }
    res.json(formatStaff(users[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add staff
router.post('/', async (req, res) => {
  try {
    const { firstname, lastname, role, airline, email, phone } = req.body;

    // Generate username from name
    const first2 = (firstname || '').toLowerCase().substring(0, 2);
    const last2 = (lastname || '').toLowerCase().substring(0, 2);
    const digits = Math.floor(Math.random() * 90 + 10);
    const username = `${first2}${last2}${digits}`;

    // Generate random password
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const allChars = uppercase + lowercase + numbers;
    let plainPassword = '';
    plainPassword += uppercase[Math.floor(Math.random() * uppercase.length)];
    plainPassword += lowercase[Math.floor(Math.random() * lowercase.length)];
    plainPassword += numbers[Math.floor(Math.random() * numbers.length)];
    for (let i = 0; i < 5; i++) {
      plainPassword += allChars[Math.floor(Math.random() * allChars.length)];
    }
    plainPassword = plainPassword.split('').sort(() => Math.random() - 0.5).join('');

    const id = `user_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const passwordHash = await bcrypt.hash(plainPassword, 10);

    await pool.query(
      'INSERT INTO user (id, username, role, firstname, lastname, email, phone, airline) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, username, role, firstname, lastname, email, phone || null, airline || null]
    );

    await pool.query(
      'INSERT INTO user_credentials (username, password_hash, must_change_password) VALUES (?, ?, 1)',
      [username, passwordHash]
    );

    const [newUser] = await pool.query(
      'SELECT id, username, role, firstname, lastname, email, phone, airline FROM user WHERE id = ?',
      [id]
    );

    res.status(201).json({
      ...formatStaff(newUser[0]),
      plainPassword,
      mustChangePassword: true
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete staff
router.delete('/:id', async (req, res) => {
  try {
    const [users] = await pool.query('SELECT role, username FROM user WHERE id = ?', [req.params.id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'Staff not found' });
    }
    if (users[0].role === 'admin') {
      return res.status(400).json({ error: 'Cannot remove admin user' });
    }

    // Delete credentials first
    await pool.query('DELETE FROM user_credentials WHERE username = ?', [users[0].username]);
    await pool.query('DELETE FROM user WHERE id = ?', [req.params.id]);

    res.json({ message: 'Staff deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
