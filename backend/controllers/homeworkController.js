const { query } = require('../database/db');
const { sendNotification } = require('../services/notificationService');

const createHomework = async (req, res) => {
  try {
    const { title, description, classId, subject, dueDate, totalMarks } = req.body;

    if (!title || !classId || !subject || !dueDate) {
      return res.status(400).json({ error: 'Title, class, subject, and due date are required' });
    }

    const attachmentUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const result = await query(
      'INSERT INTO homework (title, description, class_id, subject, due_date, total_marks, attachment_url, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [title, description, classId, subject, dueDate, totalMarks, attachmentUrl, req.user.id]
    );

    const students = await query(
      'SELECT s.parent_id FROM students s WHERE s.class_id = $1 AND s.is_active = true',
      [classId]
    );

    for (const student of students.rows) {
      await sendNotification(
        student.parent_id,
        'New Homework Assigned',
        `${title} - Due: ${dueDate}`,
        'homework',
        result.rows[0].id
      );
    }

    res.status(201).json({
      message: 'Homework created successfully',
      homework: result.rows[0]
    });
  } catch (error) {
    console.error('Create homework error:', error);
    res.status(500).json({ error: 'Failed to create homework' });
  }
};

const getHomework = async (req, res) => {
  try {
    const { classId, subject } = req.query;

    let queryText = `
      SELECT h.*, c.name as class_name, c.section, u.full_name as created_by_name
      FROM homework h
      JOIN classes c ON h.class_id = c.id
      LEFT JOIN users u ON h.created_by = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (classId) {
      queryText += ` AND h.class_id = $${paramCount}`;
      params.push(classId);
      paramCount++;
    }

    if (subject) {
      queryText += ` AND h.subject = $${paramCount}`;
      params.push(subject);
      paramCount++;
    }

    queryText += ' ORDER BY h.due_date DESC';

    const result = await query(queryText, params);

    res.json({
      homework: result.rows
    });
  } catch (error) {
    console.error('Get homework error:', error);
    res.status(500).json({ error: 'Failed to fetch homework' });
  }
};

const submitHomework = async (req, res) => {
  try {
    const { homeworkId, studentId, notes } = req.body;

    if (!homeworkId || !studentId) {
      return res.status(400).json({ error: 'Homework ID and student ID are required' });
    }

    const attachmentUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const existingSubmission = await query(
      'SELECT id FROM homework_submissions WHERE homework_id = $1 AND student_id = $2',
      [homeworkId, studentId]
    );

    let result;
    if (existingSubmission.rows.length > 0) {
      result = await query(
        'UPDATE homework_submissions SET attachment_url = $1, notes = $2, status = $3, submission_date = CURRENT_TIMESTAMP WHERE homework_id = $4 AND student_id = $5 RETURNING *',
        [attachmentUrl, notes, 'submitted', homeworkId, studentId]
      );
    } else {
      result = await query(
        'INSERT INTO homework_submissions (homework_id, student_id, attachment_url, notes, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [homeworkId, studentId, attachmentUrl, notes, 'submitted']
      );
    }

    res.json({
      message: 'Homework submitted successfully',
      submission: result.rows[0]
    });
  } catch (error) {
    console.error('Submit homework error:', error);
    res.status(500).json({ error: 'Failed to submit homework' });
  }
};

const gradeHomework = async (req, res) => {
  try {
    const { submissionId, marksObtained, feedback } = req.body;

    if (!submissionId || marksObtained === undefined) {
      return res.status(400).json({ error: 'Submission ID and marks are required' });
    }

    const result = await query(
      'UPDATE homework_submissions SET marks_obtained = $1, feedback = $2, status = $3, graded_by = $4, graded_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
      [marksObtained, feedback, 'graded', req.user.id, submissionId]
    );

    res.json({
      message: 'Homework graded successfully',
      submission: result.rows[0]
    });
  } catch (error) {
    console.error('Grade homework error:', error);
    res.status(500).json({ error: 'Failed to grade homework' });
  }
};

const getSubmissions = async (req, res) => {
  try {
    const { homeworkId, studentId } = req.query;

    let queryText = `
      SELECT hs.*, s.full_name as student_name, s.student_id, h.title as homework_title
      FROM homework_submissions hs
      JOIN students s ON hs.student_id = s.id
      JOIN homework h ON hs.homework_id = h.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (homeworkId) {
      queryText += ` AND hs.homework_id = $${paramCount}`;
      params.push(homeworkId);
      paramCount++;
    }

    if (studentId) {
      queryText += ` AND hs.student_id = $${paramCount}`;
      params.push(studentId);
      paramCount++;
    }

    queryText += ' ORDER BY hs.submission_date DESC';

    const result = await query(queryText, params);

    res.json({
      submissions: result.rows
    });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
};

module.exports = {
  createHomework,
  getHomework,
  submitHomework,
  gradeHomework,
  getSubmissions
};
