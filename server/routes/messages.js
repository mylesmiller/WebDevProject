const express = require('express');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// Get all messages (optionally filter by board_type and airline)
router.get('/', async (req, res) => {
  try {
    const { board, airline } = req.query;
    let query = 'SELECT * FROM message';
    const params = [];

    const conditions = [];
    if (board) {
      conditions.push('board_type = ?');
      params.push(board);
    }
    if (airline) {
      conditions.push('airline = ?');
      params.push(airline);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY timestamp DESC';

    const [messages] = await pool.query(query, params);

    const result = messages.map(m => ({
      ...m,
      boardType: m.board_type
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add message
router.post('/', async (req, res) => {
  try {
    const { author, airline, recipient, content, priority, boardType } = req.body;
    const id = `msg_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

    await pool.query(
      'INSERT INTO message (id, author, airline, recipient, content, timestamp, priority, board_type) VALUES (?, ?, ?, ?, ?, NOW(), ?, ?)',
      [id, author, airline || null, recipient || null, content, priority || 'normal', boardType]
    );

    const [newMessage] = await pool.query('SELECT * FROM message WHERE id = ?', [id]);
    const m = newMessage[0];
    res.status(201).json({ ...m, boardType: m.board_type });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete message
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM message WHERE id = ?', [req.params.id]);
    res.json({ message: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
