# Airport Operations Management System — Database Design

This is an **Airport Operations Management System** — a React-based web application with a MySQL backend that manages flights, passengers, baggage tracking, and staff communication.

---

## Entities, Attributes & Keys

### 1. USER
| Attribute | Type | Constraints |
|-----------|------|-------------|
| **id** (PK) | VARCHAR(50) | Auto-generated unique ID |
| username | VARCHAR(50) | UNIQUE, NOT NULL |
| role | ENUM | 'admin', 'airline_staff', 'gate_staff', 'ground_staff' |
| firstname | VARCHAR(100) | NOT NULL |
| lastname | VARCHAR(100) | NOT NULL |
| email | VARCHAR(100) | NOT NULL |
| phone | VARCHAR(10) | Optional, 10 digits |
| airline | VARCHAR(5) | Nullable; airline code for airline/gate staff |

### 2. USER_CREDENTIALS
| Attribute | Type | Constraints |
|-----------|------|-------------|
| **username** (PK, FK) | VARCHAR(50) | References User.username |
| password_hash | VARCHAR(255) | bcrypt hashed |
| must_change_password | TINYINT(1) | Default 1 |

### 3. FLIGHT
| Attribute | Type | Constraints |
|-----------|------|-------------|
| **id** (PK) | VARCHAR(100) | Format: `{AIRLINE}{FLIGHT_NUMBER}_{unique_id}` |
| flight_number | VARCHAR(10) | 2 letters + 4 digits |
| airline_name | VARCHAR(100) | Full airline name (e.g., "American Airlines") |
| gate | VARCHAR(10) | Unique among active flights |
| destination | VARCHAR(100) | Optional |
| departure_time | DATETIME | Optional |
| status | ENUM | 'scheduled', 'boarding', 'departed', 'cancelled'; default 'scheduled' |

### 4. PASSENGER
| Attribute | Type | Constraints |
|-----------|------|-------------|
| **id** (PK) | VARCHAR(10) | Exactly 6 digits |
| firstname | VARCHAR(100) | NOT NULL |
| lastname | VARCHAR(100) | NOT NULL |
| ticket_number | VARCHAR(10) | Exactly 10 digits, UNIQUE |
| flight_id (FK) | VARCHAR(100) | References Flight.id |
| status | ENUM | 'not-checked-in', 'checked-in', 'boarded'; default 'not-checked-in' |
| email | VARCHAR(100) | Optional |
| phone | VARCHAR(10) | Optional, 10 digits |
| checked_in_at | DATETIME | Nullable |
| checked_in_by (FK) | VARCHAR(50) | References User.id, nullable |
| boarded_at | DATETIME | Nullable |
| boarded_by (FK) | VARCHAR(50) | References User.id, nullable |

### 5. FLIGHT_PASSENGER (Junction Table)
| Attribute | Type | Constraints |
|-----------|------|-------------|
| **flight_id** (PK, FK) | VARCHAR(100) | References Flight.id |
| **ticket_number** (PK, FK) | VARCHAR(10) | References Passenger.ticket_number |

### 6. BAG
| Attribute | Type | Constraints |
|-----------|------|-------------|
| **id** (PK) | VARCHAR(10) | Exactly 6 digits, unique |
| ticket_number | VARCHAR(10) | References Passenger.ticket_number |
| passenger_id (FK) | VARCHAR(10) | References Passenger.id |
| flight_id (FK) | VARCHAR(100) | References Flight.id |
| location | ENUM | 'check-in', 'security', 'gate', 'loaded', 'security-violation'; default 'check-in' |

### 7. BAG_TIMELINE
| Attribute | Type | Constraints |
|-----------|------|-------------|
| **id** (PK) | INT | AUTO_INCREMENT |
| bag_id (FK) | VARCHAR(10) | References Bag.id |
| location | VARCHAR(30) | Location at this point in timeline |
| timestamp | DATETIME | NOT NULL |
| handled_by (FK) | VARCHAR(50) | References User.id, nullable |

### 8. MESSAGE
| Attribute | Type | Constraints |
|-----------|------|-------------|
| **id** (PK) | VARCHAR(50) | Unique |
| author | VARCHAR(100) | Author name |
| airline | VARCHAR(5) | Nullable; airline code |
| recipient | VARCHAR(100) | Nullable; intended recipient |
| content | TEXT | Message text |
| timestamp | DATETIME | |
| priority | ENUM | 'low', 'normal', 'high'; default 'normal' |
| board_type | ENUM | 'airline', 'gate', 'ground' |

---

## Relationships

| Relationship | Type | Description |
|-------------|------|-------------|
| User ↔ User_Credentials | 1:1 | Each user has one credentials record (via username FK) |
| Flight ↔ Passenger | M:N | Many-to-many via FLIGHT_PASSENGER junction table (flight_id, ticket_number) |
| Flight → Bag | 1:N | One flight has many bags (via flight_id FK) |
| Passenger → Bag | 1:N | One passenger has many bags (via passenger_id FK) |
| Bag → Bag_Timeline | 1:N | One bag has many timeline entries (via bag_id FK) |
| User → Passenger | 1:N | One staff member can check in / board many passengers (via checked_in_by, boarded_by FKs) |
| User → Bag_Timeline | 1:N | One staff member can handle many bags (via handled_by FK) |
| User → Message | 1:N | One user can author many messages |

---

## Business Rules
- A passenger cannot board if their bags haven't reached the gate
- A bag can only be marked "loaded" if its passenger has boarded
- Bag location progresses: check-in → security → gate → loaded (or security-violation)
- Flight status progresses: scheduled → boarding → departed (or cancelled)
- Gate assignments must be unique among active (non-departed/cancelled) flights
- Users with role `airline_staff` or `gate_staff` are scoped to a specific airline
