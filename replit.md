# PhishStream

A YouTube-powered search app for finding live Phish concerts and clips.

## Architecture

- **Frontend**: React + Tailwind CSS + shadcn/ui components, using wouter for routing
- **Backend**: Express.js server with YouTube Data API v3 integration
- **No Database**: This app is stateless — all data comes from YouTube search API

## Key Features

- Search YouTube for live Phish concerts/clips
- Filter by year (1985–present), song name, and video length (Under 5 min, 5-10 min, 10-20 min, 20+ min)
- Results display 5 at a time with "Load More" pagination
- In-app YouTube video player (embedded iframe)
- Mobile-friendly responsive design
- Dark theme with glassmorphism UI

## Environment Variables

- `YOUTUBE_API_KEY` — Required. Google YouTube Data API v3 key.

## API Routes

- `GET /api/search` — Search YouTube for Phish videos
  - Query params: `q`, `year`, `song`, `length`, `pageToken`, `maxResults`

## File Structure

- `client/src/pages/home.tsx` — Main search page with filters and video player
- `server/routes.ts` — YouTube API search endpoint
- `shared/schema.ts` — Data models (minimal, no DB needed)
