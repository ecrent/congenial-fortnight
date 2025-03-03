DROP TABLE IF EXISTS timetables;

CREATE TABLE IF NOT EXISTS timetables (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP,
    end_time TIMESTAMP
);

-- You can add more tables or initial data here as needed

INSERT INTO timetables (title, description, start_time, end_time)
VALUES ('Sample Timetable', 'This is a sample timetable description.', '2023-10-01 08:00:00', '2023-10-01 10:00:00');
