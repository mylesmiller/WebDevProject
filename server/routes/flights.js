const express = require('express');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// Get all flights (optionally filter by gate)
router.get('/', async (req, res) => {
  try {
    let query = 'SELECT * FROM flight';
    const params = [];
    if (req.query.gate) {
      query += ' WHERE gate = ?';
      params.push(req.query.gate);
    }
    query += ' ORDER BY departure_time';
    const [flights] = await pool.query(query, params);
    const result = [];
    for (const f of flights) {
      const [passengers] = await pool.query(
        'SELECT p.id FROM passenger p JOIN flight_passenger fp ON p.ticket_number = fp.ticket_number WHERE fp.flight_id = ?',
        [f.id]
      );
      result.push({
        ...f,
        airline: f.flight_number.substring(0, 2),
        airlineName: f.airline_name,
        flightNumber: f.flight_number,
        departureTime: f.departure_time,
        passengerIds: passengers.map(p => p.id)
      });
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get flight by ID
router.get('/:id', async (req, res) => {
  try {
    const [flights] = await pool.query('SELECT * FROM flight WHERE id = ?', [req.params.id]);
    if (flights.length === 0) {
      return res.status(404).json({ error: 'Flight not found' });
    }
    const f = flights[0];
    res.json({
      ...f,
      airline: f.flight_number.substring(0, 2),
      airlineName: f.airline_name,
      flightNumber: f.flight_number,
      departureTime: f.departure_time
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add flight
router.post('/', async (req, res) => {
  try {
    const { flightNumber, gate, destination, departureTime, airlineName } = req.body;
    const airline = flightNumber.substring(0, 2);

    // Check duplicate active flight number
    const [existing] = await pool.query(
      'SELECT id FROM flight WHERE flight_number = ? AND status NOT IN ("departed","cancelled")',
      [flightNumber]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Flight number already exists' });
    }

    const id = `${flightNumber}_${Date.now()}`;

    await pool.query(
      'INSERT INTO flight (id, flight_number, airline_name, gate, destination, departure_time, status) VALUES (?, ?, ?, ?, ?, ?, "scheduled")',
      [id, flightNumber, airlineName || airline, gate, destination || null, departureTime || null]
    );

    const [newFlight] = await pool.query('SELECT * FROM flight WHERE id = ?', [id]);
    const f = newFlight[0];
    res.status(201).json({
      ...f,
      airline,
      airlineName: f.airline_name,
      flightNumber: f.flight_number,
      departureTime: f.departure_time
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update flight
router.put('/:id', async (req, res) => {
  try {
    const { status, gate } = req.body;
    const flightId = req.params.id;

    const [flights] = await pool.query('SELECT * FROM flight WHERE id = ?', [flightId]);
    if (flights.length === 0) {
      return res.status(404).json({ error: 'Flight not found' });
    }

    // If changing gate, check conflicts
    if (gate !== undefined) {
      const [conflict] = await pool.query(
        'SELECT id FROM flight WHERE gate = ? AND id != ? AND status NOT IN ("departed","cancelled")',
        [gate, flightId]
      );
      if (conflict.length > 0) {
        return res.status(400).json({ error: `Gate ${gate} is already in use by another flight` });
      }
    }

    const updates = {};
    if (status !== undefined) updates.status = status;
    if (gate !== undefined) updates.gate = gate;

    if (Object.keys(updates).length > 0) {
      const setClauses = Object.keys(updates).map(k => `${k} = ?`).join(', ');
      await pool.query(`UPDATE flight SET ${setClauses} WHERE id = ?`, [...Object.values(updates), flightId]);
    }

    const [updated] = await pool.query('SELECT * FROM flight WHERE id = ?', [flightId]);
    const f = updated[0];
    res.json({
      ...f,
      airline: f.flight_number.substring(0, 2),
      airlineName: f.airline_name,
      flightNumber: f.flight_number,
      departureTime: f.departure_time
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete flight
router.delete('/:id', async (req, res) => {
  try {
    const [passengers] = await pool.query(
      'SELECT id FROM passenger WHERE flight_id = ?', [req.params.id]
    );
    if (passengers.length > 0) {
      return res.status(400).json({ error: 'Cannot remove flight with passengers. Remove passengers first.' });
    }

    await pool.query('DELETE FROM flight WHERE id = ?', [req.params.id]);
    res.json({ message: 'Flight deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get flight passengers
router.get('/:id/passengers', async (req, res) => {
  try {
    const [passengers] = await pool.query(
      `SELECT p.*, CONCAT(p.firstname, ' ', p.lastname) as name
       FROM passenger p
       JOIN flight_passenger fp ON p.ticket_number = fp.ticket_number
       WHERE fp.flight_id = ?`,
      [req.params.id]
    );
    // Add bagIds for each passenger
    for (const p of passengers) {
      const [bags] = await pool.query('SELECT id FROM bag WHERE passenger_id = ?', [p.id]);
      p.bagIds = bags.map(b => b.id);
      p.ticketNumber = p.ticket_number;
      p.flightId = p.flight_id;
      p.checkedInAt = p.checked_in_at;
      p.checkedInBy = p.checked_in_by;
      p.boardedAt = p.boarded_at;
      p.boardedBy = p.boarded_by;
    }
    res.json(passengers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
