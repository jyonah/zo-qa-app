# Zo Q&A App

A real-time Q&A application for live events. Submit questions, vote on questions from others, and display a beautiful TV wall for projectors.

## Features

- **Submit questions** — Simple form with optional name field
- **Vote on questions** — One-click upvote, tap again to remove
- **TV wall display** — Beautiful full-screen view for projectors
- **Event isolation** — Multiple events from a single install
- **Export** — Download as Markdown, CSV, or JSON
- **Admin controls** — Enable/disable submissions, voting, rate limits
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
2. Set environment variables (optional):
   - `QA_DATA_FILE` — Custom path for data storage
   - `QA_ADMIN_TOKEN` — Token for admin endpoints
3. Visit `/qa` to get started

## Usage

### For Event Organizers

1. Navigate to `/qa/admin?event=your-event-name`
2. Customize branding (title, submit button label)
3. Share `/qa/submit?event=your-event-name` with attendees
4. Display `/qa/tv?event=your-event-name` on projector
5. Export results after the event

### For Attendees

1. Visit the submit URL
2. Enter your question (optionally include your name)
3. Upvote other questions at `/qa/vote?event=your-event-name`

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `QA_DATA_FILE` | Path to JSON data store | `/home/workspace/Projects/live-qa-webapp/data/qa-store.json` |
| `QA_ADMIN_TOKEN` | Token for admin actions | (none — admin is open) |

### Admin Settings

- **Submissions enabled** — Toggle question submission
- **Voting enabled** — Toggle voting
- **Max votes per minute** — Rate limit per user

### Branding

- **Title** — Event title shown on all pages
- **Brand name** — Used in exports
- **Submit label** — Customize the submit button text
- **Logo URL** — Custom logo image

## Routes

| Route | Purpose |
|-------|---------|
| `/qa` | Landing page |
| `/qa/submit` | Submit questions |
| `/qa/vote` | Upvote questions |
| `/qa/tv` | TV wall for projectors |
| `/qa/admin` | Admin/settings panel |
| `/api/qa/questions` | List/create questions |
| `/api/qa/questions/:id` | Edit/delete own questions |
| `/api/qa/questions/:id/vote` | Toggle vote |
| `/api/qa/admin/settings` | Get/update settings |
| `/api/qa/admin/config` | Get/update branding |
| `/api/qa/admin/export` | Export data |
| `/api/qa/admin/reset` | Reset event/all data |
| `/api/qa/admin/merge` | Merge duplicate questions |

## License

MIT
