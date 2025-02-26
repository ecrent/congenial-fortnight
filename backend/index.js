const express = require('express');
const app = express();
const port = 3000;
// Import database configuration
const db = require('./config/database');

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
  console.log('somebody hit the home route');
});

// Database test route directly in main app
app.get('/api/v1/db/test', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.status(200).json({
      status: 'success',
      message: 'Database connection successful!',
      timestamp: result.rows[0].now
    });
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({
      status: 'error', 
      message: 'Database connection failed',
      details: error.message
    });
  }
});

// Database query for timetables
app.get('/api/v1/db/timetables', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM timetables');
    res.status(200).json({
      status: 'success',
      results: result.rows.length,
      data: {
        timetables: result.rows
      }
    });
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch timetables',
      details: error.message
    });
  }
});

app.get('/api/v1/timetables', (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      timetables: [
        {
          id: 1,
          name: 'Timetable 1',
          description: 'user 1 time table'
        },
        {
          id: 2,
          name: 'Timetable 2',
          description: 'user 2 time table'
        }
      ]
    }
  });
});

app.get('/api/v1/timetables/:id', (req, res) => {
  console.log(req.params.id);
  res.status(200).json({
    status: 'success',
    data: {
      timetable: {
        name: 'default timetable',
        description: 'days in the week'
      }
    }
  });
});

app.post('/api/v1/timetables', (req, res) => {
  console.log(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      timetable: req.body
    }
  });
});

app.put('/api/v1/timetables/:id', (req, res) => {
  console.log(req.params.id);
  console.log(req.body);
  res.status(200).json({
    status: 'success',
    data: {
      timetable: req.body
    }
  });
});

app.delete('/api/v1/timetables/:id', (req, res) => {
  console.log(req.params.id);
  res.status(204).json({
    status: 'success',
    data: null
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});