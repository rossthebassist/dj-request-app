import Database from 'better-sqlite3';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let db;

export function getDatabase() {
  if (!db) {
    db = new Database(join(__dirname, 'dj-requests.db'));
    db.pragma('journal_mode = WAL');
  }
  return db;
}

export function initializeDatabase() {
  const database = getDatabase();
  
  // Events table
  database.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      userId TEXT NOT NULL,
      playlistId TEXT NOT NULL,
      primaryColor TEXT DEFAULT '#FF6B35',
      secondaryColor TEXT DEFAULT '#004E89',
      accentColor TEXT DEFAULT '#F7931E',
      bannerImageUrl TEXT,
      textColor TEXT DEFAULT '#FFFFFF',
      backgroundGradient TEXT,
      isActive BOOLEAN DEFAULT 1,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Song requests table
  database.exec(`
    CREATE TABLE IF NOT EXISTS requests (
      id TEXT PRIMARY KEY,
      eventId TEXT NOT NULL,
      spotifyTrackId TEXT NOT NULL,
      spotifyTrackUri TEXT NOT NULL,
      trackName TEXT NOT NULL,
      artistName TEXT NOT NULL,
      albumImage TEXT,
      votes INTEGER DEFAULT 1,
      isPlayed BOOLEAN DEFAULT 0,
      requestedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      playedAt DATETIME,
      FOREIGN KEY (eventId) REFERENCES events(id),
      UNIQUE(eventId, spotifyTrackId)
    )
  `);

  // Request votes table (for tracking individual votes)
  database.exec(`
    CREATE TABLE IF NOT EXISTS request_votes (
      id TEXT PRIMARY KEY,
      requestId TEXT NOT NULL,
      voterIdentifier TEXT NOT NULL,
      votedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (requestId) REFERENCES requests(id),
      UNIQUE(requestId, voterIdentifier)
    )
  `);

  // User tokens table
  database.exec(`
    CREATE TABLE IF NOT EXISTS user_tokens (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      accessToken TEXT NOT NULL,
      refreshToken TEXT,
      expiresAt DATETIME,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(userId)
    )
  `);

  console.log('Database initialized successfully');
}
