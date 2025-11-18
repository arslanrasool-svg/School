const { query } = require('../database/db');
const { Expo } = require('expo-server-sdk');

const expo = new Expo();

const sendNotification = async (userId, title, body, type, referenceId) => {
  try {
    await query(
      'INSERT INTO notifications (user_id, title, body, type, reference_id) VALUES ($1, $2, $3, $4, $5)',
      [userId, title, body, type, referenceId]
    );

    const tokenResult = await query(
      'SELECT token FROM push_tokens WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [userId]
    );

    if (tokenResult.rows.length > 0) {
      const pushToken = tokenResult.rows[0].token;
      
      if (Expo.isExpoPushToken(pushToken)) {
        const messages = [{
          to: pushToken,
          sound: 'default',
          title: title,
          body: body,
          data: { type, referenceId }
        }];

        const chunks = expo.chunkPushNotifications(messages);
        for (const chunk of chunks) {
          try {
            await expo.sendPushNotificationsAsync(chunk);
          } catch (error) {
            console.error('Error sending push notification chunk:', error);
          }
        }
      }
    }

    return true;
  } catch (error) {
    console.error('Send notification error:', error);
    return false;
  }
};

const registerPushToken = async (req, res) => {
  try {
    const { token, deviceType } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Push token is required' });
    }

    const existingToken = await query(
      'SELECT id FROM push_tokens WHERE user_id = $1 AND token = $2',
      [req.user.id, token]
    );

    if (existingToken.rows.length === 0) {
      await query(
        'INSERT INTO push_tokens (user_id, token, device_type) VALUES ($1, $2, $3)',
        [req.user.id, token, deviceType]
      );
    } else {
      await query(
        'UPDATE push_tokens SET updated_at = CURRENT_TIMESTAMP WHERE user_id = $1 AND token = $2',
        [req.user.id, token]
      );
    }

    res.json({
      message: 'Push token registered successfully'
    });
  } catch (error) {
    console.error('Register push token error:', error);
    res.status(500).json({ error: 'Failed to register push token' });
  }
};

const getNotifications = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const result = await query(
      `SELECT * FROM notifications 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );

    res.json({
      notifications: result.rows
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.body;

    await query(
      'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2',
      [notificationId, req.user.id]
    );

    res.json({
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

module.exports = {
  sendNotification,
  registerPushToken,
  getNotifications,
  markAsRead
};
