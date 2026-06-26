# DJ Song Request Web App

A mobile-friendly web application for attendees to request songs at events. Integrates with Spotify to add songs to a playlist and tracks requests by votes.

## Features

- 🎵 **Spotify Integration**: Search and request songs directly from Spotify
- 📱 **Mobile Optimized**: Designed for mobile-first experience
- 🗳️ **Vote System**: Duplicate requests show as additional votes instead of duplicating in playlist
- 🎨 **Customizable**: Event-specific colors, banners, and text
- 📊 **Live Leaderboard**: Top 10 unplayed requests ranked by votes
- 🔒 **Secure**: Spotify OAuth2 authentication
- 📋 **Playlist Management**: Select existing playlists or create new ones via the app

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Spotify Developer Account

### Setup Instructions

1. **Clone the repository**
```bash
git clone https://github.com/rossthebassist/dj-request-app.git
cd dj-request-app
```

2. **Install dependencies**
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. **Create `.env` file in backend directory**
```bash
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:5173/callback
PORT=3001
DATABASE_URL=sqlite://./dj-requests.db
```

4. **Start the development servers**
```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend
cd frontend
npm run dev
```

5. **Access the app**
Open `http://localhost:5173` in your browser

## Spotify Setup

1. Go to https://developer.spotify.com/dashboard
2. Create a new app and accept the terms
3. Copy your Client ID and Client Secret
4. Set Redirect URI to `http://localhost:5173/callback` (or your production URL)
5. Add these values to your `.env` file
6. The app will handle playlist selection/creation after login

## Architecture

### Backend (Node.js/Express)
- OAuth2 flow for Spotify authentication
- Song search endpoint
- Playlist selection and creation
- Request submission and management
- Vote deduplication logic
- Playlist management

### Frontend (React + Vite)
- Mobile-responsive design
- Playlist selector/creator on setup
- Real-time search suggestions
- Request list with vote counts
- Event customization via config file

## Workflow

1. **Login**: User authenticates with Spotify
2. **Select/Create Playlist**: Choose existing playlist or create a new one
3. **Configure Event**: Set colors, banner, and text for the event
4. **Share Event**: Get a shareable link for attendees
5. **Attendees Search & Vote**: Guests search Spotify and vote on requests
6. **DJ Playlist Updates**: Songs are added to the selected playlist as they're requested

## Deployment

### Deploy Backend (Heroku/Railway/Render)
```bash
# Update SPOTIFY_REDIRECT_URI to your production URL
```

### Deploy Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy the dist folder
```

## Customization Guide

See `CUSTOMIZATION.md` for detailed theming options.

## API Endpoints

- `GET /auth/login` - Spotify login redirect
- `GET /auth/callback` - OAuth2 callback handler
- `GET /playlists` - Get user's Spotify playlists
- `POST /playlists` - Create new Spotify playlist
- `POST /events` - Create new event with playlist
- `GET /search?q=query` - Search Spotify
- `POST /requests` - Submit a song request
- `GET /requests/top?eventId=...` - Get top 10 requests
- `PUT /requests/:id/vote` - Add a vote to a request
- `PUT /requests/:id/played` - Mark request as played

## License

MIT
