# Route Templates

This directory contains route templates for the Q&A app.

## API Routes

| File | Zo Space Path | Description |
|------|---------------|-------------|
| `api/qa-questions.ts` | `/api/qa/questions` | List/create questions |
| `api/qa-questions-id.ts` | `/api/qa/questions/:id` | Edit/delete own questions |
| `api/qa-questions-id-vote.ts` | `/api/qa/questions/:id/vote` | Toggle vote |
| `api/qa-admin-settings.ts` | `/api/qa/admin/settings` | Get/update settings |
| `api/qa-admin-config.ts` | `/api/qa/admin/config` | Get/update branding |
| `api/qa-admin-export.ts` | `/api/qa/admin/export` | Export data |
| `api/qa-admin-reset.ts` | `/api/qa/admin/reset` | Reset event/all data |
| `api/qa-admin-merge.ts` | `/api/qa/admin/merge` | Merge duplicate questions |

## Page Routes

| File | Zo Space Path | Description |
|------|---------------|-------------|
| `pages/qa-landing.tsx` | `/qa` | Landing page |
| `pages/qa-submit.tsx` | `/qa/submit` | Submit questions |
| `pages/qa-vote.tsx` | `/qa/vote` | Vote on questions |
| `pages/qa-tv.tsx` | `/qa/tv` | TV wall display |
| `pages/qa-admin.tsx` | `/qa/admin` | Admin/settings panel |

## Installation

For each route:

1. Copy the file content
2. Create a new route in your Zo Space at the specified path
3. Paste the code and save

See [INSTALL.md](../INSTALL.md) for detailed instructions.
