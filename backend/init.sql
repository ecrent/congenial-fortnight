CREATE TABLE IF NOT EXISTS timetables (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data only if table is empty
INSERT INTO timetables (name, description)
SELECT 'Timetable 1', 'user 1 time table'
WHERE NOT EXISTS (SELECT 1 FROM timetables);

INSERT INTO timetables (name, description)
SELECT 'Timetable 2', 'user 2 time table'
WHERE NOT EXISTS (SELECT 1 FROM timetables);
