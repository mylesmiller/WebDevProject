-- ============================================================
-- PRESENTATION QUERIES - Airport Bag Tracking System
-- ============================================================
-- HOW TO USE:
--   1. Run `npm run seed` in terminal first to populate the database
--   2. Open MySQL Workbench, connect to airport_ops
--   3. For each demo: run the BEFORE query, then the ACTION query,
--      then the AFTER query to show the change
--   4. Highlight just the query you want and press Ctrl+Shift+Enter
--      (or click the lightning bolt icon) to run only that query
-- ============================================================

USE airport_ops;

-- ============================================================
-- 0. OVERVIEW: Show all tables exist with data
-- ============================================================
SELECT 'user' AS table_name, COUNT(*) AS row_count FROM user
UNION ALL SELECT 'user_credentials', COUNT(*) FROM user_credentials
UNION ALL SELECT 'flight', COUNT(*) FROM flight
UNION ALL SELECT 'passenger', COUNT(*) FROM passenger
UNION ALL SELECT 'flight_passenger', COUNT(*) FROM flight_passenger
UNION ALL SELECT 'bag', COUNT(*) FROM bag
UNION ALL SELECT 'bag_timeline', COUNT(*) FROM bag_timeline
UNION ALL SELECT 'message', COUNT(*) FROM message;


-- ============================================================
-- 1. SUCCESSFUL LOGIN by a staff member
-- ============================================================
-- Show the user exists and has credentials
SELECT u.id, u.username, u.role, u.firstname, u.lastname, uc.password_hash
FROM user u
JOIN user_credentials uc ON u.username = uc.username
WHERE u.username = 'albr01';
-- EXPLAIN: The app would take username 'albr01' and password 'Pass123',
-- look up this row, and use bcrypt to verify the password matches the hash.
-- Since the user exists and password matches → login succeeds.


-- ============================================================
-- 2. INVALID LOGIN by a staff member
-- ============================================================
-- Case A: Username doesn't exist → no rows returned → login fails
SELECT u.id, u.username, u.role, uc.password_hash
FROM user u
JOIN user_credentials uc ON u.username = uc.username
WHERE u.username = 'fakeuser';

-- Case B: Username exists but wrong password → bcrypt compare would fail
-- Show the user exists, but the hash won't match a wrong password
SELECT u.username, u.role, uc.password_hash
FROM user u
JOIN user_credentials uc ON u.username = uc.username
WHERE u.username = 'albr01';
-- EXPLAIN: If someone enters password 'WrongPass', bcrypt.compare('WrongPass', hash)
-- returns false → login is rejected.


-- ============================================================
-- 3. ADDING A NEW FLIGHT (by administrator)
-- ============================================================
-- BEFORE: Show current flights
SELECT id, flight_number, airline_name, gate, destination, departure_time, status FROM flight;

-- ACTION: Admin adds a new flight
INSERT INTO flight (id, flight_number, airline_name, gate, destination, departure_time, status)
VALUES ('SW4456_flight4', 'SW4456', 'Southwest Airlines', 'D7', 'Dallas (DFW)', '2026-03-12 14:30:00', 'scheduled');

-- AFTER: Show the new flight appeared
SELECT id, flight_number, airline_name, gate, destination, departure_time, status FROM flight;


-- ============================================================
-- 4. RETRIEVING FLIGHT DETAILS BY FLIGHT ID (by staff member)
-- ============================================================
-- Staff member looks up a flight by its unique ID
SELECT * FROM flight WHERE id = 'AA1234_flight1';


-- ============================================================
-- 5. VIEWING ALL PASSENGERS OF A FLIGHT (by staff member)
-- ============================================================
-- Using flight ID to find all passengers
SELECT p.id, p.firstname, p.lastname, p.ticket_number, p.status, p.email, p.phone
FROM passenger p
WHERE p.flight_id = 'AA1234_flight1';

-- Also visible in the junction table
SELECT * FROM flight_passenger WHERE flight_id = 'AA1234_flight1';


-- ============================================================
-- 6. ADDING A NEW PASSENGER (by administrator)
-- ============================================================
-- BEFORE: Show current passengers
SELECT id, firstname, lastname, ticket_number, flight_id, status FROM passenger;

-- ACTION: Admin adds a new passenger to flight DL5678
INSERT INTO passenger (id, firstname, lastname, ticket_number, flight_id, status, email, phone)
VALUES ('345678', 'Sarah', 'Williams', '3456789012', 'DL5678_flight2', 'not-checked-in', 'sarah.w@email.com', '5554444444');

INSERT INTO flight_passenger (flight_id, ticket_number)
VALUES ('DL5678_flight2', '3456789012');

-- AFTER: New passenger and flight_passenger link appear
SELECT id, firstname, lastname, ticket_number, flight_id, status FROM passenger;
SELECT * FROM flight_passenger;


-- ============================================================
-- 7. VIEWING ALL PASSENGERS (by administrator)
-- ============================================================
SELECT id, firstname, lastname, ticket_number, flight_id, status, email, phone FROM passenger;


-- ============================================================
-- 8. REMOVING A PASSENGER (by administrator)
-- ============================================================
-- BEFORE: Show passengers
SELECT id, firstname, lastname, ticket_number, flight_id FROM passenger;
SELECT * FROM flight_passenger;

-- ACTION: Remove passenger Sarah Williams by ticket number
DELETE FROM passenger WHERE ticket_number = '3456789012';
-- (flight_passenger entry is also removed automatically via ON DELETE CASCADE)

-- AFTER: Confirm she's gone from both tables
SELECT id, firstname, lastname, ticket_number, flight_id FROM passenger;
SELECT * FROM flight_passenger;


-- ============================================================
-- 9. RETRIEVING PASSENGER INFO BY TICKET NUMBER (by staff member)
-- ============================================================
SELECT * FROM passenger WHERE ticket_number = '1234567890';


-- ============================================================
-- 10. ADDING A BAG FOR A PASSENGER (by staff member)
-- ============================================================
-- BEFORE: Show bags (empty after seed)
SELECT * FROM bag;
SELECT * FROM bag_timeline;

-- ACTION: Staff adds a bag for passenger John Smith (ticket 1234567890)
INSERT INTO bag (id, ticket_number, passenger_id, flight_id, location)
VALUES ('BAG001', '1234567890', '123456', 'AA1234_flight1', 'check-in');

INSERT INTO bag_timeline (bag_id, location, timestamp, handled_by)
VALUES ('BAG001', 'check-in', NOW(), 'airline_001');

-- Also add a second bag for demo purposes (used in later sections)
INSERT INTO bag (id, ticket_number, passenger_id, flight_id, location)
VALUES ('BAG002', '1234567891', '123457', 'AA1234_flight1', 'check-in');

INSERT INTO bag_timeline (bag_id, location, timestamp, handled_by)
VALUES ('BAG002', 'check-in', NOW(), 'airline_001');

-- AFTER: Bags and timeline entries now exist
SELECT * FROM bag;
SELECT * FROM bag_timeline;


-- ============================================================
-- 11. RETRIEVING A BAG BY ITS UNIQUE ID (by staff member)
-- ============================================================
SELECT * FROM bag WHERE id = 'BAG001';
SELECT * FROM bag_timeline WHERE bag_id = 'BAG001';


-- ============================================================
-- 12. REMOVING A BAG BY ITS UNIQUE ID (by staff member)
-- ============================================================
-- BEFORE: Show bags
SELECT * FROM bag;
SELECT * FROM bag_timeline;

-- ACTION: Remove BAG002
DELETE FROM bag WHERE id = 'BAG002';
-- (bag_timeline entries removed automatically via ON DELETE CASCADE)

-- AFTER: BAG002 is gone from both tables
SELECT * FROM bag;
SELECT * FROM bag_timeline;


-- ============================================================
-- 13. CHANGING BAG LOCATION/STATUS (by staff member)
-- ============================================================
-- BEFORE: Show bag location
SELECT * FROM bag WHERE id = 'BAG001';
SELECT * FROM bag_timeline WHERE bag_id = 'BAG001' ORDER BY timestamp;

-- ACTION: Move BAG001 from 'check-in' to 'security'
UPDATE bag SET location = 'security' WHERE id = 'BAG001';

INSERT INTO bag_timeline (bag_id, location, timestamp, handled_by)
VALUES ('BAG001', 'security', NOW(), 'ground_001');

-- AFTER: Location updated and new timeline entry added
SELECT * FROM bag WHERE id = 'BAG001';
SELECT * FROM bag_timeline WHERE bag_id = 'BAG001' ORDER BY timestamp;


-- ============================================================
-- 14. CHANGING PASSENGER STATUS BY TICKET NUMBER (by staff member)
-- ============================================================
-- BEFORE: Passenger is 'not-checked-in'
SELECT id, firstname, lastname, ticket_number, status, checked_in_at, checked_in_by
FROM passenger WHERE ticket_number = '1234567890';

-- ACTION: Check in the passenger
UPDATE passenger
SET status = 'checked-in', checked_in_at = NOW(), checked_in_by = 'airline_001'
WHERE ticket_number = '1234567890';

-- AFTER: Status changed to 'checked-in' with timestamp
SELECT id, firstname, lastname, ticket_number, status, checked_in_at, checked_in_by
FROM passenger WHERE ticket_number = '1234567890';


-- ============================================================
-- 15. VIEWING GATE INFORMATION BY GATE NUMBER
-- ============================================================
SELECT * FROM flight WHERE gate = 'A12';


-- ============================================================
-- 16. VIEWING ALL BAGS AT A GATE (by ground staff)
-- ============================================================
-- By gate number
SELECT b.id AS bag_id, b.location, b.ticket_number, b.passenger_id, f.flight_number, f.gate
FROM bag b
JOIN flight f ON b.flight_id = f.id
WHERE f.gate = 'A12';

-- By flight ID
SELECT b.id AS bag_id, b.location, b.ticket_number, b.passenger_id, f.flight_number, f.gate
FROM bag b
JOIN flight f ON b.flight_id = f.id
WHERE f.id = 'AA1234_flight1';
