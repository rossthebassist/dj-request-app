import express from 'express';
import { searchTracks, getAccessToken } from '../spotify.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const accessToken = await getAccessToken(req.session.userId);
    const results = await searchTracks(q, accessToken, parseInt(limit));
    res.json(results);
  } catch (error) {
    console.error('Error searching tracks:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
