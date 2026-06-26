import express from 'express';
import { getSpotifyAuthUrl, exchangeCodeForToken, getCurrentUser } from '../spotify.js';
import { getDatabase } from '../db.js';

const router = express.Router();

router.get('/login', (req, res) => {
  try {
    console.log('[AUTH] Login endpoint called');
    console.log('[AUTH] SPOTIFY_CLIENT_ID:', process.env.SPOTIFY_CLIENT_ID ? 'SET' : 'NOT SET');
    console.log('[AUTH] SPOTIFY_REDIRECT_URI:', process.env.SPOTIFY_REDIRECT_URI);
    
    const authUrl = getSpotifyAuthUrl();
    console.log('[AUTH] Generated auth URL:', authUrl.substring(0, 50) + '...');
    
    res.json({ authUrl });
  } catch (error) {
    console.error('[AUTH] Login error:', error.message);
    res.status(500).json({ 
      error: 'Failed to generate auth URL',
      details: error.message,
      hasClientId: !!process.env.SPOTIFY_CLIENT_ID,
      hasRedirectUri: !!process.env.SPOTIFY_REDIRECT_URI
    });
  }
});

router.get('/callback', async (req, res) => {
  console.log('[AUTH CALLBACK] Called with query params:', req.query);
  const { code, state, error: spotifyError } = req.query;

  if (spotifyError) {
    console.error('[AUTH CALLBACK] Spotify error:', spotifyError);
    return res.status(400).json({ error: `Spotify error: ${spotifyError}` });
  }

  if (!code) {
    console.error('[AUTH CALLBACK] No authorization code received');
    return res.status(400).json({ error: 'No authorization code received' });
  }

  try {
    console.log('[AUTH CALLBACK] Exchanging code for token...');
    const tokenData = await exchangeCodeForToken(code);
    console.log('[AUTH CALLBACK] Got token, fetching user info...');
    
    const user = await getCurrentUser(tokenData.access_token);
    console.log('[AUTH CALLBACK] Got user:', user.id);

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
    
    console.log('[AUTH CALLBACK] Token stored in database');

    // Set session
    req.session.userId = user.id;
    req.session.user = user;

    // Redirect to frontend with user info
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const redirectUrl = `${frontendUrl}/setup?userId=${user.id}&token=${tokenData.access_token}`;
    console.log('[AUTH CALLBACK] Redirecting to:', redirectUrl);
    
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('[AUTH CALLBACK] Error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}?error=${encodeURIComponent(error.message)}`);
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
