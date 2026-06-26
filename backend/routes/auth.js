import express from 'express';
import { getSpotifyAuthUrl, exchangeCodeForToken, getCurrentUser } from '../spotify.js';
import { getDatabase } from '../db.js';

const router = express.Router();

router.get('/login', (req, res) => {
  const authUrl = getSpotifyAuthUrl();
  res.json({ authUrl });
});

router.get('/callback', async (req, res) => {
  const { code, state } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'No authorization code received' });
  }

  try {
    const tokenData = await exchangeCodeForToken(code);
    const user = await getCurrentUser(tokenData.access_token);

    // Store token in database
    const db = getDatabase();
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);
    
    const stmt = db.prepare(`
      INSERT INTO user_tokens (id, userId, accessToken, refreshToken, expiresAt)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(userId) DO UPDATE SET
        accessToken = excluded.accessToken,
        refreshToken = excluded.refreshToken,
        expiresAt = excluded.expiresAt
    `);
    
    stmt.run(
      `token_${user.id}_${Date.now()}`,
      user.id,
      tokenData.access_token,
      tokenData.refresh_token || null,
      expiresAt.toISOString()
    );

    // Set session
    req.session.userId = user.id;
    req.session.user = user;

    // Redirect to frontend with user info
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/setup?userId=${user.id}&token=${tokenData.access_token}`);
  } catch (error) {
    console.error('Auth callback error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

router.get('/user', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json(req.session.user);
});

router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ success: true });
  });
});

export default router;
