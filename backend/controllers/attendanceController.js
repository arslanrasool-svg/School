const { query } = require('../database/db');
const { sendNotification } = require('../services/notificationService');

const markAttendance = async (req, res) => {
  try {
    const { studentId, classId, date, status, notes } = req.body;

    if (!studentId || !classId || !date || !status) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!['present', 'absent', 'late', 'excused'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const existingAttendance = await query(
      'SELECT id FROM attendance WHERE student_id = $1 AND date = $2',
      [studentId, date]
    );

    let result;
    if (existingAttendance.rows.length > 0) {
      result = await query(
        'UPDATE attendance SET status = $1, notes = $2, marked_by = $3 WHERE student_id = $4 AND date = $5 RETURNING *',
        [status, notes, req.user.id, studentId, date]
      );
    } else {
      result = await query(
        'INSERT INTO attendance (student_id, class_id, date, status, notes, marked_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [studentId, classId, date, status, notes, req.user.id]
      );
    }

    const studentResult = await query(
      'SELECT s.full_name, s.parent_id, u.full_name as parent_name FROM students s JOIN users u ON s.parent_id = u.id WHERE s.id = $1',
      [studentId]
    );

    if (studentResult.rows.length > 0 && status === 'absent') {
      const student = studentResult.rows[0];
      await sendNotification(
        student.parent_id,
        'Attendance Alert',
        `${student.full_name} was marked absent on ${date}`,
        'attendance',
        result.rows[0].id
      );
    }

    res.json({
      message: 'Attendance marked successfully',
      attendance: result.rows[0]
    });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ error: 'Failed to mark attendance' });
  }
};

const getAttendance = async (req, res) => {
  try {
    const { classId, date, studentId } = req.query;

    let queryText = `
      SELECT a.*, s.full_name as student_name, s.student_id, u.full_name as marked_by_name
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      LEFT JOIN users u ON a.marked_by = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (classId) {
      queryText += ` AND a.class_id = $${paramCount}`;
      params.push(classId);
      paramCount++;
    }

    if (date) {
      queryText += ` AND a.date = $${paramCount}`;
      params.push(date);
      paramCount++;
    }

    if (studentId) {
      queryText += ` AND a.student_id = $${paramCount}`;
      params.push(studentId);
      paramCount++;
    }

    queryText += ' ORDER BY a.date DESC, s.full_name ASC';

    const result = await query(queryText, params);

    res.json({
      attendance: result.rows
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
};

const getAttendanceStats = async (req, res) => {
  try {
    const { studentId, startDate, endDate } = req.query;

    if (!studentId || !startDate || !endDate) {
      return res.status(400).json({ error: 'Student ID, start date, and end date are required' });
    }

    const result = await query(
      `SELECT 
        COUNT(*) as total_days,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_count,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_count,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_count,
        SUM(CASE WHEN status = 'excused' THEN 1 ELSE 0 END) as excused_count
      FROM attendance
      WHERE student_id = $1 AND date BETWEEN $2 AND $3`,
      [studentId, startDate, endDate]
    );

    const stats = result.rows[0];
    const attendancePercentage = stats.total_days > 0 
      ? ((parseInt(stats.present_count) / parseInt(stats.total_days)) * 100).toFixed(2)
      : 0;

    res.json({
      stats: {
        ...stats,
        attendancePercentage
      }
    });
  } catch (error) {
    console.error('Get attendance stats error:', error);
    res.status(500).json({ error: 'Failed to fetch attendance statistics' });
  }
};

module.exports = {
  markAttendance,
  getAttendance,
  getAttendanceStats
};
