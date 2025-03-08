-- Combined database initialization script for the Meeting Organizer app

-- First, drop existing tables in reverse order of dependencies
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
    session_id INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    is_ready BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for users
CREATE INDEX idx_users_session ON users(session_id);
CREATE INDEX idx_users_ready ON users(is_ready);

-- 3. Create schedules table 
CREATE TABLE IF NOT EXISTS schedules (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL CHECK (end_time > start_time),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure the time blocks don't overlap for the same user on the same day
    CONSTRAINT unique_user_day_time UNIQUE (user_id, day_of_week, start_time, end_time)
);

-- Add indexes for schedules
CREATE INDEX idx_schedules_user ON schedules(user_id);
CREATE INDEX idx_schedules_availability ON schedules(day_of_week, start_time, end_time);

-- Add some sample data for testing
INSERT INTO sessions (session_code) VALUES ('ABC12345');
INSERT INTO users (session_id, name) VALUES (1, 'Test User');
INSERT INTO schedules (user_id, day_of_week, start_time, end_time) 
VALUES 
  (1, 1, '09:00:00', '11:00:00'),  -- Monday 9-11 AM
  (1, 1, '14:00:00', '16:00:00'),  -- Monday 2-4 PM
  (1, 3, '10:00:00', '12:00:00');  -- Wednesday 10-12 AM
