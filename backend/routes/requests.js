import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../db.js';
import { addTracksToPlaylist, getAccessToken } from '../spotify.js';
import crypto from 'crypto';

const router = express.Router();

// Generate voter identifier from IP and user agent
function getVoterIdentifier(req) {
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('user-agent') || '';
  const combined = `${ip}-${userAgent}`;
  return crypto.createHash('sha256').update(combined).digest('hex').substring(0, 16);
}

// Submit song request
router.post('/', async (req, res) => {
  try {
    const { eventId, spotifyTrackId, spotifyTrackUri, trackName, artistName, albumImage } = req.body;

    if (!eventId || !spotifyTrackId || !trackName || !artistName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = getDatabase();

    // Check if event exists
    const eventStmt = db.prepare('SELECT * FROM events WHERE id = ?');
    const event = eventStmt.get(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if track already requested
    const existingStmt = db.prepare(
      'SELECT id FROM requests WHERE eventId = ? AND spotifyTrackId = ? AND isPlayed = 0'
    );
    const existing = existingStmt.get(eventId, spotifyTrackId);

    const voterIdentifier = getVoterIdentifier(req);

    if (existing) {
      // Track already exists, add a vote
      const voteStmt = db.prepare(`
        INSERT INTO request_votes (id, requestId, voterIdentifier)
        VALUES (?, ?, ?)
        ON CONFLICT(requestId, voterIdentifier) DO NOTHING
      `);
      voteStmt.run(uuidv4(), existing.id, voterIdentifier);

      // Update vote count
      const updateStmt = db.prepare(`
        UPDATE requests 
        SET votes = (SELECT COUNT(*) FROM request_votes WHERE requestId = ?)
        WHERE id = ?
      `);
      updateStmt.run(existing.id, existing.id);

      // Get updated request
      const getStmt = db.prepare('SELECT * FROM requests WHERE id = ?');
      const request = getStmt.get(existing.id);
      return res.json(request);
    }

    // Create new request
    const requestId = uuidv4();
    const insertStmt = db.prepare(`
      INSERT INTO requests (id, eventId, spotifyTrackId, spotifyTrackUri, trackName, artistName, albumImage)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    insertStmt.run(requestId, eventId, spotifyTrackId, spotifyTrackUri, trackName, artistName, albumImage || null);

    // Add initial vote
    const voteStmt = db.prepare(`
      INSERT INTO request_votes (id, requestId, voterIdentifier)
      VALUES (?, ?, ?)
    `);
    voteStmt.run(uuidv4(), requestId, voterIdentifier);

    // Get created request
    const getStmt = db.prepare('SELECT * FROM requests WHERE id = ?');
    const newRequest = getStmt.get(requestId);

    res.status(201).json(newRequest);
  } catch (error) {
    console.error('Error submitting request:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get top requests for an event
router.get('/event/:eventId/top', async (req, res) => {
  try {
    const { eventId } = req.params;
    const { limit = 10 } = req.query;

    const db = getDatabase();

    // Check if event exists
    const eventStmt = db.prepare('SELECT * FROM events WHERE id = ?');
    const event = eventStmt.get(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const stmt = db.prepare(`
      SELECT * FROM requests 
      WHERE eventId = ? AND isPlayed = 0
      ORDER BY votes DESC, requestedAt ASC
      LIMIT ?
    `);
    const requests = stmt.all(eventId, parseInt(limit));
    res.json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mark request as played and add to Spotify playlist
router.put('/:requestId/played', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { requestId } = req.params;
    const db = getDatabase();

    // Get request
    const reqStmt = db.prepare('SELECT * FROM requests WHERE id = ?');
    const request = reqStmt.get(requestId);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Get event to verify ownership
    const eventStmt = db.prepare('SELECT * FROM events WHERE id = ?');
    const event = eventStmt.get(request.eventId);
    if (!event || event.userId !== req.session.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Add track to Spotify playlist
    try {
      const accessToken = await getAccessToken(req.session.userId);
      await addTracksToPlaylist(accessToken, event.playlistId, [request.spotifyTrackUri]);
    } catch (error) {
      console.error('Error adding to Spotify playlist:', error);
      // Don't fail the request if Spotify fails, just log it
    }

    // Mark as played
    const now = new Date().toISOString();
    const updateStmt = db.prepare(`
      UPDATE requests 
      SET isPlayed = 1, playedAt = ?
      WHERE id = ?
    `);
    updateStmt.run(now, requestId);

    // Get updated request
    const getStmt = db.prepare('SELECT * FROM requests WHERE id = ?');
    const updatedRequest = getStmt.get(requestId);
    res.json(updatedRequest);
  } catch (error) {
    console.error('Error marking as played:', error);
    res.status(500).json({ error: error.message });
  }
});

// Vote on a request
router.put('/:requestId/vote', async (req, res) => {
  try {
    const { requestId } = req.params;
    const db = getDatabase();

    // Get request
    const reqStmt = db.prepare('SELECT * FROM requests WHERE id = ?');
    const request = reqStmt.get(requestId);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const voterIdentifier = getVoterIdentifier(req);

    // Add vote (or ignore if already voted)
    const voteStmt = db.prepare(`
      INSERT INTO request_votes (id, requestId, voterIdentifier)
      VALUES (?, ?, ?)
      ON CONFLICT(requestId, voterIdentifier) DO NOTHING
    `);
    voteStmt.run(uuidv4(), requestId, voterIdentifier);

    // Update vote count
    const updateStmt = db.prepare(`
      UPDATE requests 
      SET votes = (SELECT COUNT(*) FROM request_votes WHERE requestId = ?)
      WHERE id = ?
    `);
    updateStmt.run(requestId, requestId);

    // Get updated request
    const getStmt = db.prepare('SELECT * FROM requests WHERE id = ?');
    const updatedRequest = getStmt.get(requestId);
    res.json(updatedRequest);
  } catch (error) {
    console.error('Error voting:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
