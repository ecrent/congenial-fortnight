-- Create timetables table
CREATE TABLE IF NOT EXISTS timetables (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert some sample data
INSERT INTO timetables (name, description)
VALUES 
  ('Monday Schedule', 'Regular weekday schedule'),
  ('Tuesday Schedule', 'Regular weekday schedule'),
  ('Friday Schedule', 'Short day schedule');
