const express = require('express');
const router = express.Router();
const db = require('../config/database');

/**
 * Get all timetables
 * GET /api/v1/timetables
 */
router.get('/', async (req, res) => {
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

/**
 * Get timetable by ID
 * GET /api/v1/timetables/:id
 */
router.get('/:id', async (req, res) => {
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

/**
 * Create new timetable
 * POST /api/v1/timetables
 */
router.post('/', async (req, res) => {
  try {
    const { title, description } = req.body;
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

/**
 * Update timetable
 * PUT /api/v1/timetables/:id
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    console.log(`Updating timetable with ID: ${id}`, req.body);
    
    const result = await db.query(
      'UPDATE timetables SET title = $1, description = $2 WHERE id = $3 RETURNING *',
      [title, description, id]
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

/**
 * Delete timetable
 * DELETE /api/v1/timetables/:id
 */
router.delete('/:id', async (req, res) => {
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

module.exports = router;
