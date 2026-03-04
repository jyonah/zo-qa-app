# Zo Q&A App

A real-time Q&A application for live events. Submit questions, vote on questions from others, and display a beautiful TV wall for projectors.

## Features

- **Submit questions** — Simple form with optional name field
- **Vote on questions** — One-click upvote, tap again to remove
- **TV wall display** — Beautiful full-screen view for projectors
- **Easy setup** — Configure in 60 seconds with guided setup
- **Logo options** — None, URL, upload, or ask Zo to find/generate one
- **Export** — Download as Markdown, CSV, or JSON
- **Admin controls** — Enable/disable submissions, voting
- **Merge questions** — Combine duplicates with vote deduplication
- **White-label ready** — Customize title, branding, and copy

## Quick Start

### Option 1: Via Zo Agent

If you have a Zo Computer, ask your Zo Agent:

```
Install the Zo Q&A app from https://github.com/jyonah/zo-qa-app
```

See [INSTALL.md](./INSTALL.md) for detailed installation instructions.

### Option 2: Manual Setup

1. Copy the routes from `routes/` to your Zo Space
2. Set environment variable (optional):
   - `QA_DATA_FILE` — Custom path for data storage (default: `/home/workspace/qa-app/data/qa-store.json`)
3. Visit `/qa/setup` to configure your Q&A

## Usage

### For Event Organizers

1. Navigate to `/qa/setup`
2. Set your event name and branding (logo optional)
3. Share `/qa/submit` with attendees
4. Display `/qa/tv` on projector
5. Export results after the event

### For Attendees

1. Visit the submit URL
2. Enter your question (optionally include your name)
3. Upvote other questions at `/qa/vote`

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `QA_DATA_FILE` | Path to JSON data store | `/home/workspace/qa-app/data/qa-store.json` |

### Admin Settings

- **Submissions enabled** — Toggle question submission
- **Voting enabled** — Toggle voting
- **Max votes per minute** — Rate limit per user

### Branding

- **Event title** — Event title shown on all pages and exports
- **Submit label** — Customize the submit button text
- **Logo** — Four options: None, URL, Upload, or Ask Zo

## Routes

| Route | Purpose |
|-------|---------|
| `/qa` | Landing page |
| `/qa/setup` | Initial setup and configuration |
| `/qa/submit` | Submit questions |
| `/qa/vote` | Upvote questions |
| `/qa/tv` | TV wall for projectors |
| `/qa/admin` | Admin controls and export |
| `/api/qa/questions` | List/create questions |
| `/api/qa/questions/:id` | Edit/delete own questions |
| `/api/qa/questions/:id/vote` | Toggle vote |
| `/api/qa/admin/settings` | Get/update settings |
| `/api/qa/admin/config` | Get/update branding |
| `/api/qa/admin/export` | Export data |
| `/api/qa/admin/reset` | Reset all data |
| `/api/qa/admin/merge` | Merge duplicate questions |

## License

MIT
