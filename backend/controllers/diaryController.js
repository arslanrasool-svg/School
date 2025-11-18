const { query } = require('../database/db');

const createDiaryEntry = async (req, res) => {
  try {
    const { classId, date, subject, content } = req.body;

    if (!classId || !date || !content) {
      return res.status(400).json({ error: 'Class ID, date, and content are required' });
    }

    const result = await query(
      'INSERT INTO diary_entries (class_id, date, subject, content, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [classId, date, subject, content, req.user.id]
    );

    res.status(201).json({
      message: 'Diary entry created successfully',
      entry: result.rows[0]
    });
  } catch (error) {
    console.error('Create diary entry error:', error);
    res.status(500).json({ error: 'Failed to create diary entry' });
  }
};

const getDiaryEntries = async (req, res) => {
  try {
    const { classId, date, startDate, endDate } = req.query;

    let queryText = `
      SELECT d.*, c.name as class_name, c.section, u.full_name as created_by_name
      FROM diary_entries d
      JOIN classes c ON d.class_id = c.id
      LEFT JOIN users u ON d.created_by = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (classId) {
      queryText += ` AND d.class_id = $${paramCount}`;
      params.push(classId);
      paramCount++;
    }

    if (date) {
      queryText += ` AND d.date = $${paramCount}`;
      params.push(date);
      paramCount++;
    } else if (startDate && endDate) {
      queryText += ` AND d.date BETWEEN $${paramCount} AND $${paramCount + 1}`;
      params.push(startDate, endDate);
      paramCount += 2;
    }

    queryText += ' ORDER BY d.date DESC, d.created_at DESC';

    const result = await query(queryText, params);

    res.json({
      entries: result.rows
    });
  } catch (error) {
    console.error('Get diary entries error:', error);
    res.status(500).json({ error: 'Failed to fetch diary entries' });
  }
};

const updateDiaryEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const result = await query(
      'UPDATE diary_entries SET subject = $1, content = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 AND created_by = $4 RETURNING *',
      [subject, content, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Diary entry not found or unauthorized' });
    }

    res.json({
      message: 'Diary entry updated successfully',
      entry: result.rows[0]
    });
  } catch (error) {
    console.error('Update diary entry error:', error);
    res.status(500).json({ error: 'Failed to update diary entry' });
  }
};

module.exports = {
  createDiaryEntry,
  getDiaryEntries,
  updateDiaryEntry
};
