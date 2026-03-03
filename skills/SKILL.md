---
name: zo-qa-app
description: Install the Zo Q&A App - a real-time Q&A application for live events with submission, voting, TV wall display, and admin controls.
compatibility: Created for Zo Computer
metadata:
  author: jonahprice.zo.computer
  repo: https://github.com/jyonah/zo-qa-app
  version: 1.0.0
---

# Zo Q&A App Installer

Installs the Zo Q&A application into the user's Zo Space.

## What it does

1. Creates the necessary API routes in the user's Zo Space
2. Creates the page routes (landing, submit, vote, TV, admin)
3. Sets up the data directory
4. Optionally configures environment variables

## Usage

```
Install the Zo Q&A app
```

## After installation

- Visit `/qa` to see the landing page
- Visit `/qa/admin?event=your-event` to configure
- Share `/qa/submit?event=your-event` with attendees
- Display `/qa/tv?event=your-event` on projectors

## Routes created

| Route | Type | Purpose |
|-------|------|---------|
| `/qa` | Page | Landing page |
| `/qa/submit` | Page | Submit questions |
| `/qa/vote` | Page | Vote on questions |
| `/qa/tv` | Page | TV wall for projectors |
| `/qa/admin` | Page | Admin panel |
| `/api/qa/questions` | API | List/create questions |
| `/api/qa/questions/:id` | API | Edit/delete questions |
| `/api/qa/questions/:id/vote` | API | Toggle vote |
| `/api/qa/admin/settings` | API | Event settings |
| `/api/qa/admin/config` | API | Branding config |
| `/api/qa/admin/export` | API | Export data |
| `/api/qa/admin/reset` | API | Reset data |
| `/api/qa/admin/merge` | API | Merge questions |

## Files

- `scripts/install.ts` — Installs all routes via Zo API