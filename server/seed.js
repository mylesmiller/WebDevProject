const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const fs = require('fs');

const AIRLINES = {
  AA: 'American Airlines',
  DL: 'Delta Air Lines',
  UA: 'United Airlines',
  SW: 'Southwest Airlines',
  BA: 'British Airways'
};

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });

  try {
    // Drop and recreate database for a clean slate
    await connection.query('DROP DATABASE IF EXISTS airport_ops');
    console.log('Dropped existing database.');

    // Run schema (creates database and tables fresh)
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await connection.query(schema);
    console.log('Schema created.');

    await connection.query('USE airport_ops');

    // Hash passwords
    const saltRounds = 10;
    const adminHash = await bcrypt.hash('Admin123', saltRounds);
    const pass123Hash = await bcrypt.hash('Pass123', saltRounds);
    const pass234Hash = await bcrypt.hash('Pass234', saltRounds);
    const pass789Hash = await bcrypt.hash('Pass789', saltRounds);
    const pass890Hash = await bcrypt.hash('Pass890', saltRounds);
    const pass345Hash = await bcrypt.hash('Pass345', saltRounds);
    const pass456Hash = await bcrypt.hash('Pass456', saltRounds);

    // Insert users
    await connection.query(`
      INSERT INTO user (id, username, role, firstname, lastname, email, phone, airline) VALUES
      ('admin_001', 'admin', 'admin', 'System', 'Administrator', 'admin@airport.com', '5551234567', NULL),
      ('airline_001', 'albr01', 'airline_staff', 'Alice', 'Brown', 'alice.brown@aa.com', '5552345678', 'AA'),
      ('airline_002', 'bojohn02', 'airline_staff', 'Bob', 'Johnson', 'bob.johnson@delta.com', '5553456789', 'DL'),
      ('gate_001', 'evwi03', 'gate_staff', 'Eve', 'Wilson', 'eve.wilson@aa.com', '5554567890', 'AA'),
      ('gate_002', 'frda04', 'gate_staff', 'Frank', 'Davis', 'frank.davis@delta.com', '5555678901', 'DL'),
      ('ground_001', 'grta05', 'ground_staff', 'Grace', 'Taylor', 'grace.taylor@airport.com', '5556789012', NULL),
      ('ground_002', 'hemo06', 'ground_staff', 'Henry', 'Moore', 'henry.moore@airport.com', '5557890123', NULL)
    `);
    console.log('Users inserted.');

    // Insert user credentials
    await connection.query(`
      INSERT INTO user_credentials (username, password_hash, must_change_password) VALUES
      ('admin', ?, 0),
      ('albr01', ?, 0),
      ('bojohn02', ?, 0),
      ('evwi03', ?, 0),
      ('frda04', ?, 0),
      ('grta05', ?, 0),
      ('hemo06', ?, 0)
    `, [adminHash, pass123Hash, pass234Hash, pass789Hash, pass890Hash, pass345Hash, pass456Hash]);
    console.log('User credentials inserted.');

    // Insert flights (departure times relative to now)
    const now = new Date();
    const threeHours = new Date(now.getTime() + 3 * 60 * 60 * 1000);
    const fiveHours = new Date(now.getTime() + 5 * 60 * 60 * 1000);
    const twoHours = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    await connection.query(`
      INSERT INTO flight (id, flight_number, airline_name, gate, destination, departure_time, status) VALUES
      ('AA1234_flight1', 'AA1234', ?, 'A12', 'New York (JFK)', ?, 'scheduled'),
      ('DL5678_flight2', 'DL5678', ?, 'B5', 'Los Angeles (LAX)', ?, 'scheduled'),
      ('UA9012_flight3', 'UA9012', ?, 'C3', 'Chicago (ORD)', ?, 'scheduled')
    `, [AIRLINES.AA, threeHours, AIRLINES.DL, fiveHours, AIRLINES.UA, twoHours]);
    console.log('Flights inserted.');

    // Insert passengers
    await connection.query(`
      INSERT INTO passenger (id, firstname, lastname, ticket_number, flight_id, status, email, phone) VALUES
      ('123456', 'John', 'Smith', '1234567890', 'AA1234_flight1', 'not-checked-in', 'john.smith@email.com', '5551111111'),
      ('123457', 'Jane', 'Doe', '1234567891', 'AA1234_flight1', 'not-checked-in', 'jane.doe@email.com', '5552222222'),
      ('234567', 'Mike', 'Johnson', '2345678901', 'DL5678_flight2', 'not-checked-in', 'mike.j@email.com', '5553333333')
    `);
    console.log('Passengers inserted.');

    // Insert flight_passenger junction
    await connection.query(`
      INSERT INTO flight_passenger (flight_id, ticket_number) VALUES
      ('AA1234_flight1', '1234567890'),
      ('AA1234_flight1', '1234567891'),
      ('DL5678_flight2', '2345678901')
    `);
    console.log('Flight-passenger links inserted.');

    console.log('\nSeed completed successfully!');
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

seed();
