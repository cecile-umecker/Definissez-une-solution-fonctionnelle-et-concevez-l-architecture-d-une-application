-- Creat booking status enum
CREATE TYPE booking_status AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');

-- User Table (customer & agent)
CREATE TABLE "users" (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    address TEXT,
    birth_date DATE,
    role VARCHAR(50) NOT NULL 
);

-- Agency Table
CREATE TABLE agency (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL
);

-- Vehicle Table
CREATE TABLE vehicle (
    id SERIAL PRIMARY KEY,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    license_plate VARCHAR(20) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL
);

-- Booking Table
CREATE TABLE booking (
    id SERIAL PRIMARY KEY,
    start_date TIMESTAMP NOT NULL, 
    end_date TIMESTAMP NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL, 
    status booking_status DEFAULT 'PENDING',
    user_id INTEGER REFERENCES "users"(id),
    vehicle_id INTEGER REFERENCES vehicle(id),
    departure_agency_id INTEGER REFERENCES agency(id),
    return_agency_id INTEGER REFERENCES agency(id)
);

-- SupportTicket Table
CREATE TABLE support_ticket (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status BOOLEAN DEFAULT TRUE,
    subject VARCHAR(255) NOT NULL,
    user_id INTEGER REFERENCES "users"(id)
);

-- ChatMessage Table (For chat and text messages)
CREATE TABLE chat_message (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_real_time BOOLEAN DEFAULT FALSE,
    ticket_id INTEGER REFERENCES support_ticket(id),
    sender_id INTEGER REFERENCES "users"(id),
    receiver_id INTEGER REFERENCES "users"(id)
);

-- VideoSession Table (For video calls)
CREATE TABLE video_session (
    id SERIAL PRIMARY KEY,
    meeting_url VARCHAR(512),
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    ticket_id INTEGER REFERENCES support_ticket(id)
);