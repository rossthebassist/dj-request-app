import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../db.js';
import { addTracksToPlaylist, getAccessToken } from '../spotify.js';

const router = express.Router();

// Create event
router.post('/', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const {
      name,
      playlistId,
      primaryColor = '#FF6B35',
      secondaryColor = '#004E89',
      accentColor = '#F7931E',
      bannerImageUrl,
      textColor = '#FFFFFF',
      backgroundGradient
    } = req.body;

    if (!name || !playlistId) {
      return res.status(400).json({ error: 'Event name and playlist ID are required' });
    }

    const db = getDatabase();
    const eventId = uuidv4();

    const stmt = db.prepare(`
      INSERT INTO events (
        id, name, userId, playlistId, primaryColor, secondaryColor,
        accentColor, bannerImageUrl, textColor, backgroundGradient
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      eventId,
      name,
      req.session.userId,
      playlistId,
      primaryColor,
      secondaryColor,
      accentColor,
      bannerImageUrl || null,
      textColor,
      backgroundGradient || null
    );

    const getStmt = db.prepare('SELECT * FROM events WHERE id = ?');
    const event = getStmt.get(eventId);

    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user's events
router.get('/', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM events WHERE userId = ? ORDER BY createdAt DESC');
    const events = stmt.all(req.session.userId);
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get event by ID (public)
router.get('/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM events WHERE id = ? AND isActive = 1');
    const event = stmt.get(eventId);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update event
router.put('/:eventId', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { eventId } = req.params;
    const db = getDatabase();

    // Verify ownership
    const checkStmt = db.prepare('SELECT userId FROM events WHERE id = ?');
    const event = checkStmt.get(eventId);

    if (!event || event.userId !== req.session.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updates = {};
    const allowedFields = [
      'name',
      'primaryColor',
      'secondaryColor',
      'accentColor',
      'bannerImageUrl',
      'textColor',
      'backgroundGradient',
      'isActive'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.updatedAt = new Date().toISOString();

    const setClause = Object.keys(updates)
      .map(key => `${key} = ?`)
      .join(', ');

    const values = [...Object.values(updates), eventId];
    const updateStmt = db.prepare(`UPDATE events SET ${setClause} WHERE id = ?`);
    updateStmt.run(...values);

    const getStmt = db.prepare('SELECT * FROM events WHERE id = ?');
    const updatedEvent = getStmt.get(eventId);

    res.json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: error.message });
  }
});

// Deactivate event
router.delete('/:eventId', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { eventId } = req.params;
    const db = getDatabase();

    // Verify ownership
    const checkStmt = db.prepare('SELECT userId FROM events WHERE id = ?');
    const event = checkStmt.get(eventId);

    if (!event || event.userId !== req.session.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const stmt = db.prepare('UPDATE events SET isActive = 0 WHERE id = ?');
    stmt.run(eventId);

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
