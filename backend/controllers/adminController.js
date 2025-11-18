const { query } = require('../database/db');
const bcrypt = require('bcrypt');

const createUser = async (req, res) => {
  try {
    const { email, password, fullName, phone, role } = req.body;

    if (!email || !password || !fullName || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await query(
      'INSERT INTO users (email, password_hash, full_name, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, full_name, phone, role, created_at',
      [email, passwordHash, fullName, phone, role]
    );

    res.status(201).json({
      message: 'User created successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;

    let queryText = 'SELECT id, email, full_name, phone, role, profile_photo, is_active, created_at FROM users WHERE 1=1';
    const params = [];

    if (role) {
      queryText += ' AND role = $1';
      params.push(role);
    }

    queryText += ' ORDER BY created_at DESC';

    const result = await query(queryText, params);

    res.json({
      users: result.rows
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

const toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const result = await query(
      'UPDATE users SET is_active = $1 WHERE id = $2 RETURNING *',
      [isActive, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User status updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
};

const createClass = async (req, res) => {
  try {
    const { name, section, gradeLevel, academicYear, teacherId } = req.body;

    if (!name || !section || !gradeLevel || !academicYear) {
      return res.status(400).json({ error: 'Name, section, grade level, and academic year are required' });
    }

    const result = await query(
      'INSERT INTO classes (name, section, grade_level, academic_year, teacher_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, section, gradeLevel, academicYear, teacherId]
    );

    res.status(201).json({
      message: 'Class created successfully',
      class: result.rows[0]
    });
  } catch (error) {
    console.error('Create class error:', error);
    res.status(500).json({ error: 'Failed to create class' });
  }
};

const getAllClasses = async (req, res) => {
  try {
    const result = await query(
      `SELECT c.*, u.full_name as teacher_name,
        (SELECT COUNT(*) FROM students WHERE class_id = c.id AND is_active = true) as student_count
      FROM classes c
      LEFT JOIN users u ON c.teacher_id = u.id
      ORDER BY c.grade_level, c.name, c.section`
    );

    res.json({
      classes: result.rows
    });
  } catch (error) {
    console.error('Get all classes error:', error);
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
};

const createStudent = async (req, res) => {
  try {
    const { studentId, fullName, dateOfBirth, gender, classId, parentId, profilePhoto } = req.body;

    if (!studentId || !fullName || !classId || !parentId) {
      return res.status(400).json({ error: 'Student ID, name, class, and parent are required' });
    }

    const result = await query(
      'INSERT INTO students (student_id, full_name, date_of_birth, gender, class_id, parent_id, profile_photo) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [studentId, fullName, dateOfBirth, gender, classId, parentId, profilePhoto]
    );

    res.status(201).json({
      message: 'Student created successfully',
      student: result.rows[0]
    });
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({ error: 'Failed to create student' });
  }
};

const getAllStudents = async (req, res) => {
  try {
    const { classId, parentId } = req.query;

    let queryText = `
      SELECT s.*, c.name as class_name, c.section, u.full_name as parent_name, u.email as parent_email
      FROM students s
      LEFT JOIN classes c ON s.class_id = c.id
      LEFT JOIN users u ON s.parent_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (classId) {
      queryText += ` AND s.class_id = $${paramCount}`;
      params.push(classId);
      paramCount++;
    }

    if (parentId) {
      queryText += ` AND s.parent_id = $${paramCount}`;
      params.push(parentId);
      paramCount++;
    }

    queryText += ' ORDER BY s.full_name ASC';

    const result = await query(queryText, params);

    res.json({
      students: result.rows
    });
  } catch (error) {
    console.error('Get all students error:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const userCount = await query('SELECT COUNT(*) as count FROM users WHERE is_active = true');
    const studentCount = await query('SELECT COUNT(*) as count FROM students WHERE is_active = true');
    const classCount = await query('SELECT COUNT(*) as count FROM classes');
    const teacherCount = await query('SELECT COUNT(*) as count FROM users WHERE role = \'teacher\' AND is_active = true');
    const parentCount = await query('SELECT COUNT(*) as count FROM users WHERE role = \'parent\' AND is_active = true');

    const todayAttendance = await query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent
      FROM attendance WHERE date = CURRENT_DATE`
    );

    const pendingFees = await query(
      'SELECT COUNT(*) as count, SUM(amount - amount_paid) as total FROM fee_records WHERE payment_status != \'paid\''
    );

    const recentAnnouncements = await query(
      'SELECT COUNT(*) as count FROM announcements WHERE created_at >= CURRENT_DATE - INTERVAL \'7 days\''
    );

    res.json({
      analytics: {
        users: parseInt(userCount.rows[0].count),
        students: parseInt(studentCount.rows[0].count),
        classes: parseInt(classCount.rows[0].count),
        teachers: parseInt(teacherCount.rows[0].count),
        parents: parseInt(parentCount.rows[0].count),
        todayAttendance: {
          total: parseInt(todayAttendance.rows[0]?.total || 0),
          present: parseInt(todayAttendance.rows[0]?.present || 0),
          absent: parseInt(todayAttendance.rows[0]?.absent || 0)
        },
        pendingFees: {
          count: parseInt(pendingFees.rows[0]?.count || 0),
          total: parseFloat(pendingFees.rows[0]?.total || 0)
        },
        recentAnnouncements: parseInt(recentAnnouncements.rows[0].count)
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

module.exports = {
  createUser,
  getAllUsers,
  toggleUserStatus,
  createClass,
  getAllClasses,
  createStudent,
  getAllStudents,
  getAnalytics
};
