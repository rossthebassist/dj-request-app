# API Documentation

## Base URL
```
https://your-backend-url/api
```

## Authentication

Most endpoints require Spotify OAuth. Use `/auth/login` to initiate.

## Endpoints

### Authentication

#### `GET /auth/login`
Initiate Spotify OAuth flow

Response:
```json
{
  "authUrl": "https://accounts.spotify.com/authorize?..."
}
```

#### `GET /auth/callback`
OAuth callback (handled automatically)

#### `GET /auth/user`
Get current user info

Response:
```json
{
  "id": "userid123",
  "name": "John Doe",
  "email": "john@example.com",
  "image": "https://..."
}
```

#### `POST /auth/logout`
Logout current user

---

### Playlists

#### `GET /playlists`
Get user's Spotify playlists

Response:
```json
[
  {
    "id": "playlist123",
    "name": "My Playlist",
    "image": "https://...",
    "tracks": 42,
    "uri": "spotify:playlist:..."
  }
]
```

#### `POST /playlists`
Create new Spotify playlist

Request:
```json
{
  "name": "DJ Requests - Event Name",
  "description": "Optional description"
}
```

Response:
```json
{
  "id": "newplaylist123",
  "name": "DJ Requests - Event Name",
  "image": "https://...",
  "tracks": 0,
  "uri": "spotify:playlist:..."
}
```

---

### Events

#### `POST /events`
Create new event

Request:
```json
{
  "name": "Summer Party 2024",
  "playlistId": "playlist123",
  "primaryColor": "#FF6B35",
  "secondaryColor": "#004E89",
  "accentColor": "#F7931E",
  "textColor": "#FFFFFF",
  "bannerImageUrl": "https://...",
  "backgroundGradient": "linear-gradient(...)"
}
```

Response:
```json
{
  "id": "event123",
  "name": "Summer Party 2024",
  "userId": "userid123",
  "playlistId": "playlist123",
  "primaryColor": "#FF6B35",
  "secondaryColor": "#004E89",
  "accentColor": "#F7931E",
  "textColor": "#FFFFFF",
  "bannerImageUrl": "https://...",
  "backgroundGradient": "linear-gradient(...)",
  "isActive": true,
  "createdAt": "2024-06-26T18:00:00Z",
  "updatedAt": "2024-06-26T18:00:00Z"
}
```

#### `GET /events`
Get user's events (requires auth)

#### `GET /events/:eventId`
Get event details (public)

#### `PUT /events/:eventId`
Update event (requires auth + ownership)

#### `DELETE /events/:eventId`
Deactivate event (requires auth + ownership)

---

### Search

#### `GET /search?q=query&limit=20`
Search Spotify for tracks

Query Parameters:
- `q` (required): Search query
- `limit` (optional): Number of results (default 20, max 50)

Response:
```json
[
  {
    "id": "track123",
    "uri": "spotify:track:...",
    "name": "Song Title",
    "artist": "Artist Name",
    "album": "Album Name",
    "image": "https://...",
    "duration": 243000
  }
]
```

---

### Requests

#### `POST /requests`
Submit song request

Request:
```json
{
  "eventId": "event123",
  "spotifyTrackId": "track123",
  "spotifyTrackUri": "spotify:track:...",
  "trackName": "Song Title",
  "artistName": "Artist Name",
  "albumImage": "https://..."
}
```

Response:
```json
{
  "id": "request123",
  "eventId": "event123",
  "spotifyTrackId": "track123",
  "spotifyTrackUri": "spotify:track:...",
  "trackName": "Song Title",
  "artistName": "Artist Name",
  "albumImage": "https://...",
  "votes": 1,
  "isPlayed": false,
  "requestedAt": "2024-06-26T18:00:00Z",
  "playedAt": null
}
```

#### `GET /requests/event/:eventId/top?limit=10`
Get top requests for event

Query Parameters:
- `limit` (optional): Number of results (default 10)

Response: Array of request objects

#### `PUT /requests/:requestId/vote`
Vote on a request

Response: Updated request object

#### `PUT /requests/:requestId/played`
Mark request as played and add to playlist (requires auth + event ownership)

Response: Updated request object

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message"
}
```

Common status codes:
- `400`: Bad Request (missing required fields)
- `401`: Unauthorized (not logged in)
- `403`: Forbidden (not authorized to access resource)
- `404`: Not Found
- `500`: Server Error

