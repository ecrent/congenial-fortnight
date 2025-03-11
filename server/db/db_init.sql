-- Drop tables if they exist (order does not matter with CASCADE)
DROP TABLE IF EXISTS schedules CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;

-- 1. Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    session_code VARCHAR(8) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '24 hours'
);

-- Add indexes for sessions
CREATE INDEX idx_sessions_code ON sessions(session_code);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);

-- 2. Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,  -- unique constraint added
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    is_ready BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for users
CREATE INDEX idx_users_ready ON users(is_ready);

-- 3. Create schedules table 
CREATE TABLE IF NOT EXISTS schedules (
    id SERIAL PRIMARY KEY,
    session_code VARCHAR(8) NOT NULL REFERENCES sessions(session_code) ON DELETE CASCADE,
    user_name VARCHAR(100) NOT NULL REFERENCES users(name) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL CHECK (end_time > start_time),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_day_time UNIQUE (user_name, day_of_week, start_time, end_time)
);

-- Add indexes for schedules
CREATE INDEX idx_schedules_user ON schedules(user_name);
CREATE INDEX idx_schedules_availability ON schedules(day_of_week, start_time, end_time);

-- Add sample data for testing
-- Using an 8-character session code
INSERT INTO sessions (session_code) VALUES ('TES12345');

INSERT INTO users (name, email, password)
VALUES ('testuser', 'sample@example.com', 'password');

-- FIX: Added the missing session_code to match with the created session above
INSERT INTO schedules (session_code, user_name, day_of_week, start_time, end_time) 
VALUES ('TES12345', 'testuser', 1, '09:00:00', '11:00:00');  -- Monday 9-11 AM

