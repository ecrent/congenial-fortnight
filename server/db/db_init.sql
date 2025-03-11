DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS schedules CASCADE;


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
DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,         -- added email column
    password VARCHAR(255) NOT NULL,        -- added password column (store hashed in production)
    role VARCHAR(50) DEFAULT 'user',       -- added role column for admin role support
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
    
    -- Ensure the time blocks don't overlap for the same user on the same day
    CONSTRAINT unique_user_day_time UNIQUE (user_name, day_of_week, start_time, end_time)
);

-- Add indexes for schedules
CREATE INDEX idx_schedules_user ON schedules(user_name);
CREATE INDEX idx_schedules_availability ON schedules(day_of_week, start_time, end_time);

-- Add some sample data for testing
INSERT INTO sessions (session_code) VALUES ('test_session');

-- Option 2: Change the sample user’s name to something unlikely to conflict
INSERT INTO users (name, email, password)
VALUES ('testuser', 'sample@example.com', 'password');

INSERT INTO schedules (user_name, day_of_week, start_time, end_time) 
VALUES 
  ('testuser', 1, '09:00:00', '11:00:00');  -- Monday 9-11 AM

