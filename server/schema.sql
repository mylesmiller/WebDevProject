CREATE DATABASE IF NOT EXISTS airport_ops;
USE airport_ops;

CREATE TABLE IF NOT EXISTS user (
  id VARCHAR(50) PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  role ENUM('admin','airline_staff','gate_staff','ground_staff') NOT NULL,
  firstname VARCHAR(100) NOT NULL,
  lastname VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(10),
  airline VARCHAR(5)
);

CREATE TABLE IF NOT EXISTS user_credentials (
  username VARCHAR(50) PRIMARY KEY,
  password_hash VARCHAR(255) NOT NULL,
  must_change_password TINYINT(1) NOT NULL DEFAULT 1,
  FOREIGN KEY (username) REFERENCES user(username) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS flight (
  id VARCHAR(100) PRIMARY KEY,
  flight_number VARCHAR(10) NOT NULL,
  airline_name VARCHAR(100) NOT NULL,
  gate VARCHAR(10),
  destination VARCHAR(100),
  departure_time DATETIME,
  status ENUM('scheduled','boarding','departed','cancelled') NOT NULL DEFAULT 'scheduled'
);

CREATE TABLE IF NOT EXISTS passenger (
  id VARCHAR(10) PRIMARY KEY,
  firstname VARCHAR(100) NOT NULL,
  lastname VARCHAR(100) NOT NULL,
  ticket_number VARCHAR(10) NOT NULL UNIQUE,
  flight_id VARCHAR(100) NOT NULL,
  status ENUM('not-checked-in','checked-in','boarded') NOT NULL DEFAULT 'not-checked-in',
  email VARCHAR(100),
  phone VARCHAR(10),
  checked_in_at DATETIME,
  checked_in_by VARCHAR(50),
  boarded_at DATETIME,
  boarded_by VARCHAR(50),
  FOREIGN KEY (flight_id) REFERENCES flight(id),
  FOREIGN KEY (checked_in_by) REFERENCES user(id),
  FOREIGN KEY (boarded_by) REFERENCES user(id)
);

CREATE TABLE IF NOT EXISTS flight_passenger (
  flight_id VARCHAR(100) NOT NULL,
  ticket_number VARCHAR(10) NOT NULL,
  PRIMARY KEY (flight_id, ticket_number),
  FOREIGN KEY (flight_id) REFERENCES flight(id) ON DELETE CASCADE,
  FOREIGN KEY (ticket_number) REFERENCES passenger(ticket_number) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bag (
  id VARCHAR(10) PRIMARY KEY,
  ticket_number VARCHAR(10) NOT NULL,
  passenger_id VARCHAR(10) NOT NULL,
  flight_id VARCHAR(100) NOT NULL,
  location ENUM('check-in','security','gate','loaded','security-violation') NOT NULL DEFAULT 'check-in',
  FOREIGN KEY (ticket_number) REFERENCES passenger(ticket_number),
  FOREIGN KEY (passenger_id) REFERENCES passenger(id),
  FOREIGN KEY (flight_id) REFERENCES flight(id)
);

CREATE TABLE IF NOT EXISTS bag_timeline (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bag_id VARCHAR(10) NOT NULL,
  location VARCHAR(30) NOT NULL,
  timestamp DATETIME NOT NULL,
  handled_by VARCHAR(50),
  FOREIGN KEY (bag_id) REFERENCES bag(id) ON DELETE CASCADE,
  FOREIGN KEY (handled_by) REFERENCES user(id)
);

CREATE TABLE IF NOT EXISTS message (
  id VARCHAR(50) PRIMARY KEY,
  author VARCHAR(100) NOT NULL,
  airline VARCHAR(5),
  recipient VARCHAR(100),
  content TEXT NOT NULL,
  timestamp DATETIME NOT NULL,
  priority ENUM('low','normal','high') NOT NULL DEFAULT 'normal',
  board_type ENUM('airline','gate','ground') NOT NULL
);
