# Troubleshooting

## Common Issues

### "Spotify login not working"

**Check:**
1. Redirect URI matches in Spotify Dashboard and `.env` file
2. Client ID and Secret are correct
3. Backend is running on correct port
4. CORS is configured correctly

### "Playlist not showing up"

**Check:**
1. You're logged in with Spotify
2. Playlist is not archived
3. You have permission to modify playlist
4. Refresh the page and try again

### "Songs not adding to playlist"

**Check:**
1. Playlist ID is correct
2. Access token hasn't expired (refresh page)
3. Spotify API isn't rate limited
4. Check backend logs for errors

### "Mobile layout broken"

**Check:**
1. Viewport meta tag is in index.html
2. CSS media queries are working
3. Try different device sizes
4. Clear browser cache

### "Requests not appearing"

**Check:**
1. Event ID is correct
2. Database is initialized
3. Frontend and backend can communicate
4. Check network tab in browser dev tools

## Debug Mode

### Backend Debugging

```bash
NODE_DEBUG=* npm start
```

### Frontend Debugging

Open browser DevTools (F12) and:
1. Check Console for errors
2. Check Network tab for API calls
3. Use React DevTools extension

## Performance Issues

### Slow Search
- Spotify API might be slow
- Check network tab
- Try searching with fewer characters first

### Slow Page Load
- Clear browser cache
- Check for large banner images
- Optimize images (use WebP format)

### Database Growing Too Large
- Archive old events
- Delete played tracks
- Consider upgrading to PostgreSQL

## Getting Help

1. Check this troubleshooting guide
2. Search GitHub Issues
3. Check Spotify API documentation
4. Open a new GitHub Issue with:
   - Error message
   - Steps to reproduce
   - Environment details

