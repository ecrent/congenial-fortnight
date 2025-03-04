const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;
// Import database configuration
const db = require('./config/database');

// List of allowed origins
const allowedOrigins = [
  'https://bug-free-space-waffle-r9v99g7q49jc5wj7-3001.app.github.dev',
  'https://bug-free-space-waffle-r9v99g7q49jc5wj7-3000.app.github.dev' // Add localhost for testing
];

// CORS middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

app.use(express.json());

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  next();
});

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
app.get('/api/v1/timetables', async (req, res) => {
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

// Get timetable by ID
app.get('/api/v1/timetables/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Fetching timetable with ID: ${id}`);
    
    const result = await db.query('SELECT * FROM timetables WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: `Timetable with ID ${id} not found`
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        timetable: result.rows[0]
      }
    });
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch timetable',
      details: error.message
    });
  }
});

// Create new timetable
app.post('/api/v1/timetables', async (req, res) => {
  try {
    const { title: title, description } = req.body;
    console.log('Creating new timetable:', req.body);
    
    const result = await db.query(
      'INSERT INTO timetables (title, description) VALUES ($1, $2) RETURNING *',
      [title, description]
    );
    
    res.status(201).json({
      status: 'success',
      data: {
        timetable: result.rows[0]
      }
    });
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create timetable',
      details: error.message
    });
  }
});

// Update timetable
app.put('/api/v1/timetables/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    console.log(`Updating timetable with ID: ${id}`, req.body);
    
    const result = await db.query(
      'UPDATE timetables SET name = $1, description = $2 WHERE id = $3 RETURNING *',
      [name, description, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: `Timetable with ID ${id} not found`
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        timetable: result.rows[0]
      }
    });
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update timetable',
      details: error.message
    });
  }
});

// Delete timetable
app.delete('/api/v1/timetables/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Deleting timetable with ID: ${id}`);
    
    const result = await db.query('DELETE FROM timetables WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: `Timetable with ID ${id} not found`
      });
    }
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete timetable',
      details: error.message
    });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Example app listening on port ${port}`);
});