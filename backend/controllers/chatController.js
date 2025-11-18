const { query } = require('../database/db');

const sendMessage = async (req, res) => {
  try {
    const { receiverId, message } = req.body;

    if (!receiverId || !message) {
      return res.status(400).json({ error: 'Receiver ID and message are required' });
    }

    const attachmentUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const result = await query(
      'INSERT INTO chat_messages (sender_id, receiver_id, message, attachment_url) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, receiverId, message, attachmentUrl]
    );

    req.io && req.io.to(`user_${receiverId}`).emit('new_message', result.rows[0]);

    res.status(201).json({
      message: 'Message sent successfully',
      chatMessage: result.rows[0]
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

const getMessages = async (req, res) => {
  try {
    const { otherUserId } = req.query;

    if (!otherUserId) {
      return res.status(400).json({ error: 'Other user ID is required' });
    }

    const result = await query(
      `SELECT cm.*, 
        sender.full_name as sender_name, sender.profile_photo as sender_photo,
        receiver.full_name as receiver_name, receiver.profile_photo as receiver_photo
      FROM chat_messages cm
      JOIN users sender ON cm.sender_id = sender.id
      JOIN users receiver ON cm.receiver_id = receiver.id
      WHERE (cm.sender_id = $1 AND cm.receiver_id = $2)
        OR (cm.sender_id = $2 AND cm.receiver_id = $1)
      ORDER BY cm.created_at ASC`,
      [req.user.id, otherUserId]
    );

    await query(
      'UPDATE chat_messages SET is_read = true, read_at = CURRENT_TIMESTAMP WHERE receiver_id = $1 AND sender_id = $2 AND is_read = false',
      [req.user.id, otherUserId]
    );

    res.json({
      messages: result.rows
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

const getConversations = async (req, res) => {
  try {
    const result = await query(
      `SELECT DISTINCT ON (other_user_id)
        other_user_id,
        other_user_name,
        other_user_photo,
        last_message,
        last_message_time,
        unread_count
      FROM (
        SELECT 
          CASE 
            WHEN cm.sender_id = $1 THEN cm.receiver_id 
            ELSE cm.sender_id 
          END as other_user_id,
          CASE 
            WHEN cm.sender_id = $1 THEN receiver.full_name 
            ELSE sender.full_name 
          END as other_user_name,
          CASE 
            WHEN cm.sender_id = $1 THEN receiver.profile_photo 
            ELSE sender.profile_photo 
          END as other_user_photo,
          cm.message as last_message,
          cm.created_at as last_message_time,
          (SELECT COUNT(*) FROM chat_messages 
           WHERE receiver_id = $1 
           AND sender_id = CASE WHEN cm.sender_id = $1 THEN cm.receiver_id ELSE cm.sender_id END
           AND is_read = false) as unread_count
        FROM chat_messages cm
        JOIN users sender ON cm.sender_id = sender.id
        JOIN users receiver ON cm.receiver_id = receiver.id
        WHERE cm.sender_id = $1 OR cm.receiver_id = $1
        ORDER BY cm.created_at DESC
      ) conversations
      ORDER BY other_user_id, last_message_time DESC`,
      [req.user.id]
    );

    res.json({
      conversations: result.rows
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  getConversations
};
