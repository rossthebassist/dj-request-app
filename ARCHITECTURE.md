# Architecture Overview

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite (upgradeable to PostgreSQL/MongoDB)
- **Authentication**: Spotify OAuth2
- **API**: RESTful

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: CSS3
- **Icons**: Lucide React
- **HTTP Client**: Axios

## Project Structure

```
dj-request-app/
├── backend/
│   ├── routes/
│   │   ├── auth.js          # Authentication endpoints
│   │   ├── playlists.js     # Playlist management
│   │   ├── search.js        # Spotify search
│   │   ├── requests.js      # Song requests & voting
│   │   └── events.js        # Event management
│   ├── server.js            # Express app setup
│   ├── db.js                # Database initialization
│   ├── spotify.js           # Spotify API wrapper
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx           # App header
│   │   │   ├── Login.jsx            # Login page
│   │   │   ├── Setup.jsx            # Event setup wizard
│   │   │   ├── Dashboard.jsx        # Event list
│   │   │   └── EventRequests.jsx    # Request interface
│   │   ├── hooks/
│   │   │   ├── useEventConfig.js    # Event config hook
│   │   │   └── useApi.js            # API hook
│   │   ├── styles/
│   │   │   └── main.css             # Global styles
│   │   ├── App.jsx                  # Main app component
│   │   └── main.jsx                 # React entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── .env.example
├── README.md
├── DEPLOYMENT.md
├── CUSTOMIZATION.md
└── API.md
```

## Data Flow

### User Login
1. User clicks "Login with Spotify"
2. Frontend redirects to `/auth/login`
3. Spotify OAuth flow completes
4. Backend receives authorization code
5. Backend exchanges code for access token
6. Token stored in database
7. User session created
8. Frontend redirected to setup page

### Event Creation
1. User selects/creates playlist
2. User customizes event (colors, name, banner)
3. Frontend POST to `/events`
4. Backend creates event in database
5. User redirected to dashboard

### Song Request
1. Guest searches for song (frontend queries `/search`)
2. Guest clicks "Request" on song
3. Frontend POST to `/requests`
4. Backend checks if track already requested
5. If new: create request with 1 vote
6. If existing: increment vote count
7. Frontend refreshes request list

### DJ Playback
1. DJ marks request as "played"
2. Backend adds track to Spotify playlist
3. Backend marks request as played in database
4. Request removed from top 10 on frontend
5. Frontend shows next request

## Database Schema

### events
- id (UUID)
- name (string)
- userId (string)
- playlistId (string)
- primaryColor, secondaryColor, accentColor (hex)
- bannerImageUrl (URL)
- textColor (hex)
- backgroundGradient (CSS)
- isActive (boolean)
- createdAt, updatedAt (timestamp)

### requests
- id (UUID)
- eventId (FK -> events)
- spotifyTrackId (string)
- spotifyTrackUri (string)
- trackName (string)
- artistName (string)
- albumImage (URL)
- votes (integer)
- isPlayed (boolean)
- requestedAt (timestamp)
- playedAt (timestamp)

### request_votes
- id (UUID)
- requestId (FK -> requests)
- voterIdentifier (string - hashed IP+UA)
- votedAt (timestamp)

### user_tokens
- id (UUID)
- userId (string)
- accessToken (string)
- refreshToken (string)
- expiresAt (timestamp)

## Key Features

### Vote Deduplication
- When duplicate request submitted:
  - Check if track already in requests table
  - If yes: add vote instead of duplicating
  - Voter identified by hashed IP + User Agent
  - Prevents duplicate votes from same device

### Real-time Updates
- Frontend polls `/requests/event/:eventId/top` every 5 seconds
- Shows live vote counts
- Displays newly added requests instantly

### Authentication Flow
1. OAuth tokens stored securely in database
2. Tokens refreshed automatically when expired
3. Session persists across page reloads
4. Logout clears session

### Spotify Integration
- Searches tracks via Spotify API
- Creates/accesses playlists
- Adds tracks to playlist when marked as played
- Handles API rate limiting gracefully

## Security Considerations

- OAuth2 for Spotify auth (no password storage)
- Session secrets for CSRF protection
- CORS configured to production domain
- Input validation on all endpoints
- Voter identification via hashed IP+UA (privacy-friendly)
- Database transaction support for consistency

## Scalability

Current setup handles:
- ~100 concurrent users per event
- ~1000 requests per event
- ~10,000 total votes

For larger scale:
- Upgrade to PostgreSQL
- Add Redis caching
- Implement WebSockets for real-time updates
- Add load balancer
- Use CDN for frontend

