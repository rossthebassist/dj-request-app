import express from 'express';
import { getUserPlaylists, createPlaylist, getAccessToken } from '../spotify.js';

const router = express.Router();

// Get user's playlists
router.get('/', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const accessToken = await getAccessToken(req.session.userId);
    const playlists = await getUserPlaylists(accessToken);
    res.json(playlists);
  } catch (error) {
    console.error('Error fetching playlists:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new playlist
router.post('/', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Playlist name is required' });
    }

    const accessToken = await getAccessToken(req.session.userId);
    const playlist = await createPlaylist(accessToken, name, description);
    res.json(playlist);
  } catch (error) {
    console.error('Error creating playlist:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
