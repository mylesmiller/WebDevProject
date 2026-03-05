const express = require('express');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

function formatBag(b, timeline = []) {
  return {
    ...b,
    ticketNumber: b.ticket_number,
    passengerId: b.passenger_id,
    flightId: b.flight_id,
    timeline: timeline.map(t => ({
      location: t.location,
      timestamp: t.timestamp,
      handledBy: t.handled_by
    }))
  };
}

// Get all bags (optionally filter by gate or flightId)
router.get('/', async (req, res) => {
  try {
    let query = 'SELECT b.* FROM bag b';
    const params = [];
    if (req.query.gate) {
      query += ' JOIN flight f ON b.flight_id = f.id WHERE f.gate = ?';
      params.push(req.query.gate);
    } else if (req.query.flightId) {
      query += ' WHERE b.flight_id = ?';
      params.push(req.query.flightId);
    }
    const [bags] = await pool.query(query, params);
    const result = [];
    for (const b of bags) {
      const [timeline] = await pool.query(
        'SELECT * FROM bag_timeline WHERE bag_id = ? ORDER BY timestamp', [b.id]
      );
      result.push(formatBag(b, timeline));
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get bag by ID
router.get('/:id', async (req, res) => {
  try {
    const [bags] = await pool.query('SELECT * FROM bag WHERE id = ?', [req.params.id]);
    if (bags.length === 0) {
      return res.status(404).json({ error: 'Bag not found' });
    }
    const [timeline] = await pool.query(
      'SELECT * FROM bag_timeline WHERE bag_id = ? ORDER BY timestamp', [req.params.id]
    );
    res.json(formatBag(bags[0], timeline));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add bag
router.post('/', async (req, res) => {
  try {
    const { bagId, ticketNumber } = req.body;
    const staffId = req.session.user.id;

    // Check duplicate bag ID
    const [existing] = await pool.query('SELECT id FROM bag WHERE id = ?', [bagId]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Bag ID already exists' });
    }

    // Find passenger by ticket number
    const [passengers] = await pool.query(
      'SELECT * FROM passenger WHERE ticket_number = ?', [ticketNumber]
    );
    if (passengers.length === 0) {
      return res.status(400).json({ error: 'Passenger not found with this ticket number' });
    }

    const passenger = passengers[0];

    await pool.query(
      'INSERT INTO bag (id, ticket_number, passenger_id, flight_id, location) VALUES (?, ?, ?, ?, "check-in")',
      [bagId, ticketNumber, passenger.id, passenger.flight_id]
    );

    // Add initial timeline entry
    await pool.query(
      'INSERT INTO bag_timeline (bag_id, location, timestamp, handled_by) VALUES (?, "check-in", NOW(), ?)',
      [bagId, staffId]
    );

    const [newBag] = await pool.query('SELECT * FROM bag WHERE id = ?', [bagId]);
    const [timeline] = await pool.query(
      'SELECT * FROM bag_timeline WHERE bag_id = ? ORDER BY timestamp', [bagId]
    );
    res.status(201).json(formatBag(newBag[0], timeline));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update bag location
router.put('/:id/location', async (req, res) => {
  try {
    const { location } = req.body;
    const staffId = req.session.user.id;
    const bagId = req.params.id;

    const [bags] = await pool.query('SELECT * FROM bag WHERE id = ?', [bagId]);
    if (bags.length === 0) {
      return res.status(404).json({ error: 'Bag not found' });
    }

    // When loading, verify passenger has boarded
    if (location === 'loaded') {
      const [passengers] = await pool.query(
        'SELECT status FROM passenger WHERE id = ?', [bags[0].passenger_id]
      );
      if (passengers.length === 0 || passengers[0].status !== 'boarded') {
        return res.status(400).json({ error: 'Cannot load bag - passenger has not boarded the plane yet' });
      }
    }

    await pool.query('UPDATE bag SET location = ? WHERE id = ?', [location, bagId]);

    // Add timeline entry
    await pool.query(
      'INSERT INTO bag_timeline (bag_id, location, timestamp, handled_by) VALUES (?, ?, NOW(), ?)',
      [bagId, location, staffId]
    );

    const [updated] = await pool.query('SELECT * FROM bag WHERE id = ?', [bagId]);
    const [timeline] = await pool.query(
      'SELECT * FROM bag_timeline WHERE bag_id = ? ORDER BY timestamp', [bagId]
    );
    res.json(formatBag(updated[0], timeline));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete bag
router.delete('/:id', async (req, res) => {
  try {
    const [bags] = await pool.query('SELECT * FROM bag WHERE id = ?', [req.params.id]);
    if (bags.length === 0) {
      return res.status(404).json({ error: 'Bag not found' });
    }

    // Delete timeline first
    await pool.query('DELETE FROM bag_timeline WHERE bag_id = ?', [req.params.id]);
    await pool.query('DELETE FROM bag WHERE id = ?', [req.params.id]);

    res.json({ message: 'Bag deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
