const { query } = require('../database/db');

const createResult = async (req, res) => {
  try {
    const { studentId, classId, subject, examType, term, academicYear, totalMarks, marksObtained, grade, remarks } = req.body;

    if (!studentId || !classId || !subject || !examType || !term || !academicYear || totalMarks === undefined || marksObtained === undefined) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    const existingResult = await query(
      'SELECT id FROM results WHERE student_id = $1 AND subject = $2 AND exam_type = $3 AND term = $4 AND academic_year = $5',
      [studentId, subject, examType, term, academicYear]
    );

    let result;
    if (existingResult.rows.length > 0) {
      result = await query(
        'UPDATE results SET total_marks = $1, marks_obtained = $2, grade = $3, remarks = $4, created_by = $5 WHERE student_id = $6 AND subject = $7 AND exam_type = $8 AND term = $9 AND academic_year = $10 RETURNING *',
        [totalMarks, marksObtained, grade, remarks, req.user.id, studentId, subject, examType, term, academicYear]
      );
    } else {
      result = await query(
        'INSERT INTO results (student_id, class_id, subject, exam_type, term, academic_year, total_marks, marks_obtained, grade, remarks, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
        [studentId, classId, subject, examType, term, academicYear, totalMarks, marksObtained, grade, remarks, req.user.id]
      );
    }

    res.status(201).json({
      message: 'Result saved successfully',
      result: result.rows[0]
    });
  } catch (error) {
    console.error('Create result error:', error);
    res.status(500).json({ error: 'Failed to save result' });
  }
};

const getResults = async (req, res) => {
  try {
    const { studentId, term, academicYear } = req.query;

    let queryText = `
      SELECT r.*, s.full_name as student_name, s.student_id, c.name as class_name, c.section
      FROM results r
      JOIN students s ON r.student_id = s.id
      JOIN classes c ON r.class_id = c.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (studentId) {
      queryText += ` AND r.student_id = $${paramCount}`;
      params.push(studentId);
      paramCount++;
    }

    if (term) {
      queryText += ` AND r.term = $${paramCount}`;
      params.push(term);
      paramCount++;
    }

    if (academicYear) {
      queryText += ` AND r.academic_year = $${paramCount}`;
      params.push(academicYear);
      paramCount++;
    }

    queryText += ' ORDER BY r.subject ASC';

    const result = await query(queryText, params);

    res.json({
      results: result.rows
    });
  } catch (error) {
    console.error('Get results error:', error);
    res.status(500).json({ error: 'Failed to fetch results' });
  }
};

const getStudentReport = async (req, res) => {
  try {
    const { studentId, term, academicYear } = req.query;

    if (!studentId || !term || !academicYear) {
      return res.status(400).json({ error: 'Student ID, term, and academic year are required' });
    }

    const results = await query(
      `SELECT r.*, s.full_name as student_name, s.student_id, c.name as class_name, c.section
      FROM results r
      JOIN students s ON r.student_id = s.id
      JOIN classes c ON r.class_id = c.id
      WHERE r.student_id = $1 AND r.term = $2 AND r.academic_year = $3
      ORDER BY r.subject ASC`,
      [studentId, term, academicYear]
    );

    if (results.rows.length === 0) {
      return res.status(404).json({ error: 'No results found for this student' });
    }

    const totalMarksSum = results.rows.reduce((sum, r) => sum + parseInt(r.total_marks), 0);
    const marksObtainedSum = results.rows.reduce((sum, r) => sum + parseInt(r.marks_obtained), 0);
    const percentage = ((marksObtainedSum / totalMarksSum) * 100).toFixed(2);

    res.json({
      student: {
        name: results.rows[0].student_name,
        studentId: results.rows[0].student_id,
        class: `${results.rows[0].class_name} - ${results.rows[0].section}`
      },
      term,
      academicYear,
      subjects: results.rows,
      summary: {
        totalMarks: totalMarksSum,
        marksObtained: marksObtainedSum,
        percentage
      }
    });
  } catch (error) {
    console.error('Get student report error:', error);
    res.status(500).json({ error: 'Failed to fetch student report' });
  }
};

module.exports = {
  createResult,
  getResults,
  getStudentReport
};
