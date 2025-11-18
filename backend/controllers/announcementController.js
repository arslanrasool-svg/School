const { query } = require('../database/db');
const { sendNotification } = require('../services/notificationService');

const createAnnouncement = async (req, res) => {
  try {
    const { title, content, priority, targetAudience, classId, targetUserId, expiresAt } = req.body;

    if (!title || !content || !targetAudience) {
      return res.status(400).json({ error: 'Title, content, and target audience are required' });
    }

    if (!['urgent', 'normal', 'low'].includes(priority || 'normal')) {
      return res.status(400).json({ error: 'Invalid priority' });
    }

    if (!['all', 'teachers', 'parents', 'class', 'individual'].includes(targetAudience)) {
      return res.status(400).json({ error: 'Invalid target audience' });
    }

    const attachmentUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const result = await query(
      'INSERT INTO announcements (title, content, priority, target_audience, class_id, target_user_id, attachment_url, created_by, expires_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [title, content, priority || 'normal', targetAudience, classId, targetUserId, attachmentUrl, req.user.id, expiresAt]
    );

    let recipients = [];
    if (targetAudience === 'all') {
      const users = await query('SELECT id FROM users WHERE is_active = true AND id != $1', [req.user.id]);
      recipients = users.rows.map(u => u.id);
    } else if (targetAudience === 'teachers') {
      const users = await query('SELECT id FROM users WHERE role = $1 AND is_active = true', ['teacher']);
      recipients = users.rows.map(u => u.id);
    } else if (targetAudience === 'parents') {
      const users = await query('SELECT id FROM users WHERE role = $1 AND is_active = true', ['parent']);
      recipients = users.rows.map(u => u.id);
    } else if (targetAudience === 'class' && classId) {
      const students = await query('SELECT parent_id FROM students WHERE class_id = $1 AND is_active = true', [classId]);
      recipients = students.rows.map(s => s.parent_id);
    } else if (targetAudience === 'individual' && targetUserId) {
      recipients = [targetUserId];
    }

    for (const userId of recipients) {
      await sendNotification(
        userId,
        title,
        content.substring(0, 100),
        'announcement',
        result.rows[0].id
      );
    }

    res.status(201).json({
      message: 'Announcement created successfully',
      announcement: result.rows[0]
    });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ error: 'Failed to create announcement' });
  }
};

const getAnnouncements = async (req, res) => {
  try {
    const { targetAudience, classId } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    let queryText = `
      SELECT a.*, u.full_name as created_by_name, c.name as class_name, c.section
      FROM announcements a
      LEFT JOIN users u ON a.created_by = u.id
      LEFT JOIN classes c ON a.class_id = c.id
      WHERE (a.expires_at IS NULL OR a.expires_at > CURRENT_TIMESTAMP)
      AND (
        a.target_audience = 'all'
        OR (a.target_audience = 'teachers' AND $2 = 'teacher')
        OR (a.target_audience = 'parents' AND $2 = 'parent')
        OR (a.target_audience = 'individual' AND a.target_user_id = $1)
    `;

    const params = [userId, userRole];
    let paramCount = 3;

    if (classId) {
      queryText += ` OR (a.target_audience = 'class' AND a.class_id = $${paramCount})`;
      params.push(classId);
      paramCount++;
    } else if (userRole === 'parent') {
      queryText += ` OR (a.target_audience = 'class' AND a.class_id IN (SELECT class_id FROM students WHERE parent_id = $1))`;
    }

    queryText += ') ORDER BY a.priority = \'urgent\' DESC, a.created_at DESC';

    const result = await query(queryText, params);

    res.json({
      announcements: result.rows
    });
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
};

const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM announcements WHERE id = $1 AND created_by = $2 RETURNING *',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Announcement not found or unauthorized' });
    }

    res.json({
      message: 'Announcement deleted successfully'
    });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({ error: 'Failed to delete announcement' });
  }
};

module.exports = {
  createAnnouncement,
  getAnnouncements,
  deleteAnnouncement
};
