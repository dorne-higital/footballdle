# Google Analytics Setup Guide

This guide will help you set up Google Analytics 4 (GA4) for your Footballdle app.

## Prerequisites

1. A Google Analytics account
2. A GA4 property set up for your website

## Step 1: Get Your Google Analytics ID

1. Go to [Google Analytics](https://analytics.google.com/)
2. Select your property (or create a new one)
3. Go to **Admin** → **Data Streams**
4. Click on your web stream (or create a new one)
5. Copy the **Measurement ID** (format: `G-XXXXXXXXXX`)

## Step 2: Set Up Environment Variables

1. Create a `.env` file in your project root (if it doesn't exist)
2. Add your Google Analytics ID:

```env
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

Replace `G-XXXXXXXXXX` with your actual Measurement ID.

## Step 3: Test the Setup

1. Start your development server: `npm run dev`
2. Open your browser's developer tools
3. Go to the **Console** tab
4. You should see: "Google Analytics is ready!"
5. Check the **Network** tab for requests to `google-analytics.com`

## Step 4: Verify in Google Analytics

1. Go to your Google Analytics dashboard
2. Navigate to **Reports** → **Realtime** → **Overview**
3. Visit your website
4. You should see your visit appear in real-time

## What's Being Tracked

### Automatic Events
- **Page views** - Every page navigation
- **User engagement** - Time on page, scroll depth

### Custom Events
- **Game events**:
  - `game_start` - When a user starts the daily game
  - `game_win` - When a user wins (with number of guesses)
  - `game_loss` - When a user loses (with number of guesses)
  
- **Challenge events**:
  - `challenge_start` - When a user starts challenge mode
  - `challenge_win` - When a user wins challenge (with time used)
  - `challenge_loss` - When a user loses challenge (with time used)
  
- **UI events**:
  - `theme_change` - When a user changes themes
  - `modal_open` - When modals are opened
  - `share` - When content is shared

## Privacy Considerations

- Analytics only runs on the client side
- No personal data is collected
- Users can opt out using browser extensions or settings
- Consider adding a privacy policy to your website

## Troubleshooting

### Analytics not working?
1. Check that your `.env` file has the correct ID
2. Ensure the ID starts with `G-`
3. Check browser console for errors
4. Verify the plugin is loading in the Network tab

### Events not showing up?
1. Check that you're in the correct GA4 property
2. Look for events in **Reports** → **Engagement** → **Events**
3. There may be a 24-48 hour delay for some reports

## Production Deployment

When deploying to production:

1. Set the environment variable on your hosting platform
2. For Vercel: Add `GOOGLE_ANALYTICS_ID` in your project settings
3. For Netlify: Add it in your environment variables
4. For other platforms: Check their documentation for environment variable setup

## Additional Configuration

You can customize the analytics setup by modifying:
- `app/plugins/gtag.client.ts` - Main configuration
- `app/composables/useAnalytics.ts` - Custom events
- `nuxt.config.ts` - Runtime configuration 