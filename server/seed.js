const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const fs = require('fs');

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

    // Only insert the admin user — all other data should be entered through the program
    const adminHash = await bcrypt.hash('Admin123', 10);

    await connection.query(`
      INSERT INTO user (id, username, role, firstname, lastname, email, phone, airline) VALUES
      ('admin_001', 'admin', 'admin', 'System', 'Administrator', 'admin@airport.com', '5551234567', NULL)
    `);

    await connection.query(`
      INSERT INTO user_credentials (username, password_hash, must_change_password) VALUES
      ('admin', ?, 0)
    `, [adminHash]);

    console.log('Admin user created.');
    console.log('  Username: admin');
    console.log('  Password: Admin123');
    console.log('\nSeed completed. Add all other data through the program.');
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

seed();
