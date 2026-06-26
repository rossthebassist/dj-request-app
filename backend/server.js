import express from 'express';
import cors from 'cors';
import session from 'express-session';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';

import authRoutes from './routes/auth.js';
import playlistRoutes from './routes/playlists.js';
import searchRoutes from './routes/search.js';
import requestRoutes from './routes/requests.js';
import eventRoutes from './routes/events.js';
import { initializeDatabase } from './db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize database
initializeDatabase();

// CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://dj-request-app-drab.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`CORS request from origin: ${origin}`);
      callback(null, true); // Allow for debugging
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - Origin: ${req.get('origin')}`);
  next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/playlists', playlistRoutes);
app.use('/search', searchRoutes);
app.use('/requests', requestRoutes);
app.use('/events', eventRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    frontend_url: process.env.FRONTEND_URL || 'not set'
  });
});

// Config endpoint for debugging
app.get('/config', (req, res) => {
  res.json({
    frontend_url: process.env.FRONTEND_URL || 'not set',
    spotify_redirect_uri: process.env.SPOTIFY_REDIRECT_URI || 'not set',
    node_env: process.env.NODE_ENV || 'development',
    port: PORT,
    allowed_origins: allowedOrigins
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`DJ Request App Backend`);
  console.log(`========================================`);
  console.log(`Port: ${PORT}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'not configured'}`);
  console.log(`Spotify Redirect URI: ${process.env.SPOTIFY_REDIRECT_URI || 'not configured'}`);
  console.log(`Node Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`========================================\n`);
});
