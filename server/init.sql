DROP TABLE IF EXISTS timetables;

CREATE TABLE IF NOT EXISTS timetables (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL

);

-- You can add more tables or initial data here as needed

INSERT INTO timetables (title, description)
VALUES ('Sample Timetable', 'This is a sample timetable description.');
