const { query } = require('../database/db');

const createAlbum = async (req, res) => {
  try {
    const { title, description, eventDate } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const coverPhoto = req.file ? `/uploads/${req.file.filename}` : null;

    const result = await query(
      'INSERT INTO gallery_albums (title, description, event_date, cover_photo, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, description, eventDate, coverPhoto, req.user.id]
    );

    res.status(201).json({
      message: 'Album created successfully',
      album: result.rows[0]
    });
  } catch (error) {
    console.error('Create album error:', error);
    res.status(500).json({ error: 'Failed to create album' });
  }
};

const getAlbums = async (req, res) => {
  try {
    const result = await query(
      `SELECT a.*, u.full_name as created_by_name,
        (SELECT COUNT(*) FROM gallery_photos WHERE album_id = a.id) as photo_count
      FROM gallery_albums a
      LEFT JOIN users u ON a.created_by = u.id
      ORDER BY a.event_date DESC, a.created_at DESC`
    );

    res.json({
      albums: result.rows
    });
  } catch (error) {
    console.error('Get albums error:', error);
    res.status(500).json({ error: 'Failed to fetch albums' });
  }
};

const uploadPhoto = async (req, res) => {
  try {
    const { albumId, caption } = req.body;

    if (!albumId || !req.file) {
      return res.status(400).json({ error: 'Album ID and photo are required' });
    }

    const photoUrl = `/uploads/${req.file.filename}`;

    const result = await query(
      'INSERT INTO gallery_photos (album_id, photo_url, caption, uploaded_by) VALUES ($1, $2, $3, $4) RETURNING *',
      [albumId, photoUrl, caption, req.user.id]
    );

    res.status(201).json({
      message: 'Photo uploaded successfully',
      photo: result.rows[0]
    });
  } catch (error) {
    console.error('Upload photo error:', error);
    res.status(500).json({ error: 'Failed to upload photo' });
  }
};

const getPhotos = async (req, res) => {
  try {
    const { albumId } = req.query;

    if (!albumId) {
      return res.status(400).json({ error: 'Album ID is required' });
    }

    const result = await query(
      `SELECT p.*, u.full_name as uploaded_by_name
      FROM gallery_photos p
      LEFT JOIN users u ON p.uploaded_by = u.id
      WHERE p.album_id = $1
      ORDER BY p.created_at DESC`,
      [albumId]
    );

    res.json({
      photos: result.rows
    });
  } catch (error) {
    console.error('Get photos error:', error);
    res.status(500).json({ error: 'Failed to fetch photos' });
  }
};

module.exports = {
  createAlbum,
  getAlbums,
  uploadPhoto,
  getPhotos
};
