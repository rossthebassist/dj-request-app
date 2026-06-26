# Deployment Guide

## Prerequisites
- Node.js 18+
- GitHub account
- Heroku, Railway, Vercel, or Netlify account

## Deploy Backend

### Option 1: Heroku

1. **Create Heroku app**
```bash
heroku create dj-request-app-backend
cd backend
heroku login
```

2. **Set environment variables**
```bash
heroku config:set SPOTIFY_CLIENT_ID=your_client_id
heroku config:set SPOTIFY_CLIENT_SECRET=your_client_secret
heroku config:set SPOTIFY_REDIRECT_URI=https://your-frontend-url/callback
heroku config:set SESSION_SECRET=$(openssl rand -hex 32)
```

3. **Deploy**
```bash
git push heroku main
```

### Option 2: Railway

1. Connect your GitHub repo to Railway
2. Set root directory to `backend`
3. Add environment variables in Railway dashboard
4. Railway will auto-deploy on push

### Option 3: Render

1. Create new Web Service on render.com
2. Connect GitHub repo
3. Set build command: `npm install`
4. Set start command: `node server.js`
5. Add environment variables
6. Deploy

## Deploy Frontend

### Option 1: Vercel

1. **Connect GitHub**
```bash
npm i -g vercel
vercel
```

2. **Configure**
- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`

3. **Environment Variables**
```
VITE_API_URL=https://your-backend-url
```

### Option 2: Netlify

1. Connect GitHub repo to Netlify
2. Build settings:
   - Build command: `cd frontend && npm run build`
   - Publish directory: `frontend/dist`
3. Add environment variable: `VITE_API_URL`
4. Deploy

## Environment Variables

### Backend (.env)
```
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=https://your-frontend-url/callback
PORT=3001
NODE_ENV=production
DATABASE_URL=sqlite://./dj-requests.db
SESSION_SECRET=your_random_session_secret
FRONTEND_URL=https://your-frontend-url
```

### Frontend (.env)
```
VITE_API_URL=https://your-backend-url
```

## Spotify OAuth Setup

1. Go to https://developer.spotify.com/dashboard
2. Create/select your app
3. Set Redirect URIs:
   - Development: `http://localhost:5173/callback`
   - Production: `https://your-frontend-url/callback`
4. Copy Client ID and Secret
5. Add to environment variables

## Database (Production)

### SQLite (Current - works for small events)
No additional setup needed. Database file is created automatically.

### MongoDB (Recommended for scale)

1. Create MongoDB Atlas cluster
2. Install mongoose:
```bash
cd backend
npm install mongoose
```
3. Update `db.js` to use MongoDB
4. Set `DATABASE_URL` in environment

### PostgreSQL

1. Set up PostgreSQL instance
2. Install pg:
```bash
cd backend
npm install pg
```
3. Update `db.js` to use pg
4. Set `DATABASE_URL` in environment

## Monitoring

- **Backend logs**: Check platform logs (Heroku/Railway/Render)
- **Frontend errors**: Use Sentry or similar service
- **Performance**: Monitor API response times

## Security Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong `SESSION_SECRET`
- [ ] Enable HTTPS only
- [ ] Set CORS to production domain
- [ ] Regularly update dependencies
- [ ] Use environment variables for secrets
- [ ] Enable database backups

## Scaling

For large events:
1. Upgrade to PostgreSQL or MongoDB
2. Add Redis for caching
3. Use load balancer for backend
4. Enable CDN for frontend
5. Set up monitoring and alerting
