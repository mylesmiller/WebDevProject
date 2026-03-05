const express = require('express');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// Helper to format passenger for API response
function formatPassenger(p) {
  return {
    ...p,
    name: p.firstname + ' ' + p.lastname,
    ticketNumber: p.ticket_number,
    flightId: p.flight_id,
    checkedInAt: p.checked_in_at,
    checkedInBy: p.checked_in_by,
    boardedAt: p.boarded_at,
    boardedBy: p.boarded_by
  };
}

// Get all passengers
router.get('/', async (req, res) => {
  try {
    const [passengers] = await pool.query('SELECT * FROM passenger');
    const result = [];
    for (const p of passengers) {
      const [bags] = await pool.query('SELECT id FROM bag WHERE passenger_id = ?', [p.id]);
      result.push({ ...formatPassenger(p), bagIds: bags.map(b => b.id) });
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get passenger by ticket number
router.get('/ticket/:ticketNumber', async (req, res) => {
  try {
    const [passengers] = await pool.query(
      'SELECT * FROM passenger WHERE ticket_number = ?', [req.params.ticketNumber]
    );
    if (passengers.length === 0) {
      return res.status(404).json({ error: 'Passenger not found' });
    }
    const p = passengers[0];
    const [bags] = await pool.query('SELECT id FROM bag WHERE passenger_id = ?', [p.id]);
    res.json({ ...formatPassenger(p), bagIds: bags.map(b => b.id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get passenger by ID
router.get('/:id', async (req, res) => {
  try {
    const [passengers] = await pool.query('SELECT * FROM passenger WHERE id = ?', [req.params.id]);
    if (passengers.length === 0) {
      return res.status(404).json({ error: 'Passenger not found' });
    }
    const p = passengers[0];
    const [bags] = await pool.query('SELECT id FROM bag WHERE passenger_id = ?', [p.id]);
    res.json({ ...formatPassenger(p), bagIds: bags.map(b => b.id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add passenger
router.post('/', async (req, res) => {
  try {
    const { passengerId, firstname, lastname, ticketNumber, flightId, email, phone } = req.body;

    // Check duplicate ID
    const [existing] = await pool.query('SELECT id FROM passenger WHERE id = ?', [passengerId]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Passenger ID already exists' });
    }

    // Check duplicate ticket
    const [existingTicket] = await pool.query('SELECT id FROM passenger WHERE ticket_number = ?', [ticketNumber]);
    if (existingTicket.length > 0) {
      return res.status(400).json({ error: 'Ticket number already exists. One ticket per passenger.' });
    }

    // Verify flight exists
    const [flights] = await pool.query('SELECT id FROM flight WHERE id = ?', [flightId]);
    if (flights.length === 0) {
      return res.status(400).json({ error: 'Flight does not exist' });
    }

    await pool.query(
      'INSERT INTO passenger (id, firstname, lastname, ticket_number, flight_id, status, email, phone) VALUES (?, ?, ?, ?, ?, "not-checked-in", ?, ?)',
      [passengerId, firstname, lastname, ticketNumber, flightId, email || null, phone || null]
    );

    // Insert into junction table
    await pool.query(
      'INSERT INTO flight_passenger (flight_id, ticket_number) VALUES (?, ?)',
      [flightId, ticketNumber]
    );

    const [newPassenger] = await pool.query('SELECT * FROM passenger WHERE id = ?', [passengerId]);
    res.status(201).json({ ...formatPassenger(newPassenger[0]), bagIds: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete passenger by ticket number
router.delete('/ticket/:ticketNumber', async (req, res) => {
  try {
    const [passengers] = await pool.query('SELECT * FROM passenger WHERE ticket_number = ?', [req.params.ticketNumber]);
    if (passengers.length === 0) {
      return res.status(404).json({ error: 'Passenger not found' });
    }

    const passenger = passengers[0];

    // Delete bag timelines for this passenger's bags
    await pool.query(
      'DELETE bt FROM bag_timeline bt JOIN bag b ON bt.bag_id = b.id WHERE b.passenger_id = ?',
      [passenger.id]
    );

    // Delete bags
    await pool.query('DELETE FROM bag WHERE passenger_id = ?', [passenger.id]);

    // Delete from junction table
    await pool.query('DELETE FROM flight_passenger WHERE ticket_number = ?', [passenger.ticket_number]);

    // Delete passenger
    await pool.query('DELETE FROM passenger WHERE id = ?', [passenger.id]);

    res.json({ message: 'Passenger deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete passenger by ID
router.delete('/:id', async (req, res) => {
  try {
    const [passengers] = await pool.query('SELECT * FROM passenger WHERE id = ?', [req.params.id]);
    if (passengers.length === 0) {
      return res.status(404).json({ error: 'Passenger not found' });
    }

    const passenger = passengers[0];

    // Delete bag timelines for this passenger's bags
    await pool.query(
      'DELETE bt FROM bag_timeline bt JOIN bag b ON bt.bag_id = b.id WHERE b.passenger_id = ?',
      [req.params.id]
    );

    // Delete bags
    await pool.query('DELETE FROM bag WHERE passenger_id = ?', [req.params.id]);

    // Delete from junction table
    await pool.query('DELETE FROM flight_passenger WHERE ticket_number = ?', [passenger.ticket_number]);

    // Delete passenger
    await pool.query('DELETE FROM passenger WHERE id = ?', [req.params.id]);

    res.json({ message: 'Passenger deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check in passenger
router.put('/:id/checkin', async (req, res) => {
  try {
    const [passengers] = await pool.query('SELECT * FROM passenger WHERE id = ?', [req.params.id]);
    if (passengers.length === 0) {
      return res.status(404).json({ error: 'Passenger not found' });
    }

    if (passengers[0].status !== 'not-checked-in') {
      return res.status(400).json({ error: 'Passenger is already checked in' });
    }

    const staffId = req.session.user.id;
    await pool.query(
      'UPDATE passenger SET status = "checked-in", checked_in_at = NOW(), checked_in_by = ? WHERE id = ?',
      [staffId, req.params.id]
    );

    const [updated] = await pool.query('SELECT * FROM passenger WHERE id = ?', [req.params.id]);
    const [bags] = await pool.query('SELECT id FROM bag WHERE passenger_id = ?', [req.params.id]);
    res.json({ ...formatPassenger(updated[0]), bagIds: bags.map(b => b.id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Board passenger
router.put('/:id/board', async (req, res) => {
  try {
    const [passengers] = await pool.query('SELECT * FROM passenger WHERE id = ?', [req.params.id]);
    if (passengers.length === 0) {
      return res.status(404).json({ error: 'Passenger not found' });
    }

    if (passengers[0].status === 'not-checked-in') {
      return res.status(400).json({ error: 'Passenger must be checked in before boarding' });
    }
    if (passengers[0].status === 'boarded') {
      return res.status(400).json({ error: 'Passenger is already boarded' });
    }

    const staffId = req.session.user.id;
    await pool.query(
      'UPDATE passenger SET status = "boarded", boarded_at = NOW(), boarded_by = ? WHERE id = ?',
      [staffId, req.params.id]
    );

    const [updated] = await pool.query('SELECT * FROM passenger WHERE id = ?', [req.params.id]);
    const [bags] = await pool.query('SELECT id FROM bag WHERE passenger_id = ?', [req.params.id]);
    res.json({ ...formatPassenger(updated[0]), bagIds: bags.map(b => b.id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
