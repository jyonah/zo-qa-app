# Installation Guide for Zo Agents

This document provides instructions for Zo Agents to install the Q&A app on a user's Zo Computer.

## Prerequisites

- Zo Computer with space routes enabled
- No external dependencies required

## Installation Steps

### 1. Create Data Directory

```bash
mkdir -p /home/workspace/qa-app/data
```

### 2. Create API Routes

Create the following API routes in the user's Zo Space:

#### `/api/qa/questions`
- Copy from `routes/api/qa-questions.ts`
- Handles GET (list questions) and POST (create question)

#### `/api/qa/questions/:id`
- Copy from `routes/api/qa-questions-id.ts`
- Handles PATCH (edit) and DELETE (own questions)

#### `/api/qa/questions/:id/vote`
- Copy from `routes/api/qa-questions-id-vote.ts`
- Handles POST (toggle vote)

#### `/api/qa/admin/settings`
- Copy from `routes/api/qa-admin-settings.ts`
- Handles GET/POST for event settings

#### `/api/qa/admin/config`
- Copy from `routes/api/qa-admin-config.ts`
- Handles GET/POST for branding/config

#### `/api/qa/admin/export`
- Copy from `routes/api/qa-admin-export.ts`
- Handles GET for data export

#### `/api/qa/admin/reset`
- Copy from `routes/api/qa-admin-reset.ts`
- Handles POST for event/full reset

#### `/api/qa/admin/merge`
- Copy from `routes/api/qa-admin-merge.ts`
- Handles POST for question merging

### 3. Create Page Routes

Create the following page routes:

#### `/qa`
- Copy from `routes/pages/qa-landing.tsx`
- Landing page with links to submit/vote/tv

#### `/qa/submit`
- Copy from `routes/pages/qa-submit.tsx`
- Question submission form

#### `/qa/vote`
- Copy from `routes/pages/qa-vote.tsx`
- Vote on questions

#### `/qa/tv`
- Copy from `routes/pages/qa-tv.tsx`
- TV wall display

#### `/qa/admin`
- Copy from `routes/pages/qa-admin.tsx`
- Admin/settings panel

### 4. Set Environment Variables (Optional)

Direct the user to [Settings > Advanced](/?t=settings&s=advanced) to configure:

- `QA_DATA_FILE` — Custom data path (default: `/home/workspace/qa-app/data/qa-store.json`)
- `QA_ADMIN_TOKEN` — Token for admin actions (default: none/open)

### 5. Verify Installation

Test by visiting:
- `/qa` — Should show landing page
- `/qa/admin` — Should show admin panel

## Customization Notes

The app supports:
- Multiple events via `?event=name` parameter
- Custom branding via admin panel
- No authentication required by default (admin is open)

## Uninstallation

To remove:
1. Delete all `/api/qa/*` routes
2. Delete all `/qa/*` routes
3. Delete data directory: `rm -rf /home/workspace/qa-app`
4. Remove environment variables if set
