# Customization Guide

## Event Configuration

When creating an event, you can customize the following:

### Colors
- **Primary Color**: Main brand color used for buttons and highlights
- **Secondary Color**: Supporting color for gradients and backgrounds
- **Accent Color**: Highlights and CTAs (Call-To-Action buttons)
- **Text Color**: Main text color (default white)

### Visual Elements
- **Event Name**: Display name shown at the top
- **Banner Image**: Large header image (optional)
- **Background Gradient**: Custom CSS gradient for the entire app

## Theming Example

```javascript
{
  "name": "Summer Festival 2024",
  "primaryColor": "#FF6B35",      // Orange
  "secondaryColor": "#004E89",    // Blue
  "accentColor": "#F7931E",       // Gold
  "textColor": "#FFFFFF",         // White
  "bannerImageUrl": "https://example.com/banner.jpg",
  "backgroundGradient": "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)"
}
```

## Sharing Your Event

1. After creating an event, copy the event ID from your dashboard
2. Share the link: `https://your-domain.com/?eventId={event-id}`
3. Attendees can access the song request interface without logging in

## Mobile Experience

The app is fully optimized for mobile:
- Search bar at the top for easy access
- Large touch-friendly buttons
- Swipeable vote interactions
- Real-time updates (polls every 5 seconds)
- Responsive layout for all screen sizes

## Tips

- Use **high contrast colors** for better mobile visibility
- Keep banner images under 1MB for faster loading
- Update event colors to match your venue lighting
- Test on mobile devices before going live
