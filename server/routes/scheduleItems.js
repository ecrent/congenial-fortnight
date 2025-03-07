const express = require('express');
const router = express.Router();
const db = require('../config/database');

/**
 * Get all schedule items for a timetable
 * GET /api/v1/timetables/:timetableId/items
 */
router.get('/:timetableId/items', async (req, res) => {
  try {
    const { timetableId } = req.params;
    
    // Check if timetable exists
    const timetableCheck = await db.query(
      'SELECT id FROM timetables WHERE id = $1',
      [timetableId]
    );
    
    if (timetableCheck.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: `Timetable with ID ${timetableId} not found`
      });
    }
    
    // Get all schedule items for this timetable
    const result = await db.query(
      'SELECT * FROM schedule_items WHERE timetable_id = $1 ORDER BY start_time',
      [timetableId]
    );
    
    res.status(200).json({
      status: 'success',
      results: result.rows.length,
      data: {
        scheduleItems: result.rows
      }
    });
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch schedule items',
      details: error.message
    });
  }
});

/**
 * Get a specific schedule item
 * GET /api/v1/timetables/:timetableId/items/:itemId
 */
router.get('/:timetableId/items/:itemId', async (req, res) => {
  try {
    const { timetableId, itemId } = req.params;
    
    // Get the specific schedule item
    const result = await db.query(
      'SELECT * FROM schedule_items WHERE id = $1 AND timetable_id = $2',
      [itemId, timetableId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Schedule item not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        scheduleItem: result.rows[0]
      }
    });
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch schedule item',
      details: error.message
    });
  }
});

/**
 * Create a new schedule item
 * POST /api/v1/timetables/:timetableId/items
 */
router.post('/:timetableId/items', async (req, res) => {
  try {
    const { timetableId } = req.params;
    const { title, description, start_time, end_time, location } = req.body;
    
    // Check if timetable exists
    const timetableCheck = await db.query(
      'SELECT id FROM timetables WHERE id = $1',
      [timetableId]
    );
    
    if (timetableCheck.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: `Timetable with ID ${timetableId} not found`
      });
    }
    
    // Create the schedule item
    const result = await db.query(
      'INSERT INTO schedule_items (timetable_id, title, description, start_time, end_time, location) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [timetableId, title, description, start_time, end_time, location]
    );
    
    res.status(201).json({
      status: 'success',
      data: {
        scheduleItem: result.rows[0]
      }
    });
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create schedule item',
      details: error.message
    });
  }
});

/**
 * Update a schedule item
 * PUT /api/v1/timetables/:timetableId/items/:itemId
 */
router.put('/:timetableId/items/:itemId', async (req, res) => {
  try {
    const { timetableId, itemId } = req.params;
    const { title, description, start_time, end_time, location } = req.body;
    
    // Update the schedule item
    const result = await db.query(
      'UPDATE schedule_items SET title = $1, description = $2, start_time = $3, end_time = $4, location = $5 WHERE id = $6 AND timetable_id = $7 RETURNING *',
      [title, description, start_time, end_time, location, itemId, timetableId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Schedule item not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        scheduleItem: result.rows[0]
      }
    });
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update schedule item',
      details: error.message
    });
  }
});

/**
 * Delete a schedule item
 * DELETE /api/v1/timetables/:timetableId/items/:itemId
 */
router.delete('/:timetableId/items/:itemId', async (req, res) => {
  try {
    const { timetableId, itemId } = req.params;
    
    // Delete the schedule item
    const result = await db.query(
      'DELETE FROM schedule_items WHERE id = $1 AND timetable_id = $2 RETURNING id',
      [itemId, timetableId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Schedule item not found'
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
      message: 'Failed to delete schedule item',
      details: error.message
    });
  }
});

module.exports = router;
