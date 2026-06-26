import axios from 'axios';
import { getDatabase } from './db.js';

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';
const SPOTIFY_AUTH_BASE = 'https://accounts.spotify.com/api/token';

const spotifyClient = axios.create({
  baseURL: SPOTIFY_API_BASE
});

export function getSpotifyAuthUrl() {
  const params = new URLSearchParams({
    client_id: process.env.SPOTIFY_CLIENT_ID,
    response_type: 'code',
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
    scope: [
      'playlist-modify-public',
      'playlist-modify-private',
      'user-library-read'
    ].join(' ')
  });

  return `https://accounts.spotify.com/authorize?${params}`;
}

export async function exchangeCodeForToken(code) {
  try {
    const response = await axios.post(SPOTIFY_AUTH_BASE, null, {
      params: {
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
        client_id: process.env.SPOTIFY_CLIENT_ID,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error exchanging code for token:', error.message);
    throw error;
  }
}

export async function getAccessToken(userId) {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM user_tokens WHERE userId = ?');
  const token = stmt.get(userId);

  if (!token) {
    throw new Error('No token found for user');
  }

  // Check if token needs refresh
  if (new Date(token.expiresAt) < new Date()) {
    return await refreshAccessToken(userId, token.refreshToken);
  }

  return token.accessToken;
}

export async function refreshAccessToken(userId, refreshToken) {
  try {
    const response = await axios.post(SPOTIFY_AUTH_BASE, null, {
      params: {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: process.env.SPOTIFY_CLIENT_ID,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET
      }
    });

    const db = getDatabase();
    const expiresAt = new Date(Date.now() + response.data.expires_in * 1000);
    
    const stmt = db.prepare(`
      UPDATE user_tokens 
      SET accessToken = ?, expiresAt = ?
      WHERE userId = ?
    `);
    stmt.run(response.data.access_token, expiresAt.toISOString(), userId);

    return response.data.access_token;
  } catch (error) {
    console.error('Error refreshing token:', error.message);
    throw error;
  }
}

export async function searchTracks(query, accessToken, limit = 20) {
  try {
    const response = await spotifyClient.get('/search', {
      params: {
        q: query,
        type: 'track',
        limit
      },
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    return response.data.tracks.items.map(track => ({
      id: track.id,
      uri: track.uri,
      name: track.name,
      artist: track.artists[0]?.name || 'Unknown Artist',
      album: track.album.name,
      image: track.album.images[0]?.url,
      duration: track.duration_ms
    }));
  } catch (error) {
    console.error('Error searching tracks:', error.message);
    throw error;
  }
}

export async function getUserPlaylists(accessToken) {
  try {
    const response = await spotifyClient.get('/me/playlists', {
      params: { limit: 50 },
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    return response.data.items.map(playlist => ({
      id: playlist.id,
      name: playlist.name,
      image: playlist.images[0]?.url,
      tracks: playlist.tracks.total,
      uri: playlist.uri
    }));
  } catch (error) {
    console.error('Error fetching playlists:', error.message);
    throw error;
  }
}

export async function createPlaylist(accessToken, name, description = '') {
  try {
    // First get user ID
    const userResponse = await spotifyClient.get('/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const userId = userResponse.data.id;

    // Create playlist
    const response = await spotifyClient.post(`/users/${userId}/playlists`, {
      name,
      description,
      public: false
    }, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    return {
      id: response.data.id,
      name: response.data.name,
      image: response.data.images?.[0]?.url,
      tracks: 0,
      uri: response.data.uri
    };
  } catch (error) {
    console.error('Error creating playlist:', error.message);
    throw error;
  }
}

export async function addTracksToPlaylist(accessToken, playlistId, trackUris) {
  try {
    // Spotify has a limit of 100 tracks per request
    const chunks = [];
    for (let i = 0; i < trackUris.length; i += 100) {
      chunks.push(trackUris.slice(i, i + 100));
    }

    for (const chunk of chunks) {
      await spotifyClient.post(`/playlists/${playlistId}/tracks`, {
        uris: chunk
      }, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
    }
  } catch (error) {
    console.error('Error adding tracks to playlist:', error.message);
    throw error;
  }
}

export async function getCurrentUser(accessToken) {
  try {
    const response = await spotifyClient.get('/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    return {
      id: response.data.id,
      name: response.data.display_name,
      email: response.data.email,
      image: response.data.images?.[0]?.url
    };
  } catch (error) {
    console.error('Error getting current user:', error.message);
    throw error;
  }
}
