# Zo Q&A App — Installation & Testing Guide

**Purpose**: Install and test the Zo Q&A App on a Zo instance, then generate a diagnostic report.

**Audience**: Zo Agents (automated) with user check-ins between phases.

**Total Phases**: 7

**Estimated Time**: 10-15 minutes

**Timeout Handling**: If approaching 15-minute timeout, skip to Phase 7 (Report Generation) with partial results.

---

## Overview

This document guides a Zo Agent through installing and testing the Q&A app. The process is divided into **phases** with check-ins between each. Complete as many steps as possible within each phase before checking in with the user.

**Important**:
- Do NOT stop on failure. Continue to next step.
- Record all results (pass/fail, errors, timing).
- Only report failure status after completing ALL phases.

---

## Phase 1: Pre-Flight Checks

**Goal**: Verify the environment is ready for installation.

**Steps**:

### 1.1 Check Zo Space Access
```bash
# Verify you can list routes
curl -s -o /dev/null -w "%{http_code}" https://api.zo.computer/zo/space/routes
```
- **Expected**: HTTP 200 or 401 (either means endpoint exists)
- **Record**: `zo_space_access: [pass/fail]`

### 1.2 Check for Route Conflicts
```bash
# List existing routes
# Using Zo's space tools or API
```
- **Action**: Use `list_space_routes()` tool or equivalent
- **Check**: No existing routes at `/qa/*` or `/api/qa/*`
- **Record**: `route_conflicts: [none/list of conflicts]`

### 1.3 Verify GitHub Access
```bash
curl -s -o /dev/null -w "%{http_code}" https://raw.githubusercontent.com/jyonah/zo-qa-app/main/routes/api/qa-questions.ts
```
- **Expected**: HTTP 200
- **Record**: `github_access: [pass/fail]`

### 1.4 Create Data Directory
```bash
mkdir -p /home/workspace/qa-app/data
echo '{"events":{}}' > /home/workspace/qa-app/data/qa-store.json
```
- **Expected**: No errors
- **Record**: `data_directory: [pass/fail]`

### 1.5 Record Install Location
```bash
echo "QA_DATA_FILE=/home/workspace/qa-app/data/qa-store.json" > /home/workspace/qa-app/.install-info
```
- **Record**: `install_location: /home/workspace/qa-app`

**Phase 1 Check-In**:
Report to user:
```
Phase 1 Complete: Pre-Flight Checks
- Zo Space access: [status]
- Route conflicts: [status]
- GitHub access: [status]
- Data directory: [status]
- Install location: /home/workspace/qa-app

Proceed to Phase 2 (API Routes Installation)?
```

---

## Phase 2: API Routes Installation

**Goal**: Create all 8 API routes.

**Steps**: Install each route using Zo's `update_space_route()` tool or API. Fetch code from GitHub raw URLs.

### 2.1 Install `/api/qa/questions`
- **Source**: `https://raw.githubusercontent.com/jyonah/zo-qa-app/main/routes/api/qa-questions.ts`
- **Type**: `api`
- **Record**: `api_questions: [pass/fail, error if any]`

### 2.2 Install `/api/qa/questions/:id`
- **Source**: `https://raw.githubusercontent.com/jyonah/zo-qa-app/main/routes/api/qa-questions-id.ts`
- **Type**: `api`
- **Record**: `api_questions_id: [pass/fail, error if any]`

### 2.3 Install `/api/qa/questions/:id/vote`
- **Source**: `https://raw.githubusercontent.com/jyonah/zo-qa-app/main/routes/api/qa-questions-id-vote.ts`
- **Type**: `api`
- **Record**: `api_vote: [pass/fail, error if any]`

### 2.4 Install `/api/qa/admin/settings`
- **Source**: `https://raw.githubusercontent.com/jyonah/zo-qa-app/main/routes/api/qa-admin-settings.ts`
- **Type**: `api`
- **Record**: `api_settings: [pass/fail, error if any]`

### 2.5 Install `/api/qa/admin/config`
- **Source**: `https://raw.githubusercontent.com/jyonah/zo-qa-app/main/routes/api/qa-admin-config.ts`
- **Type**: `api`
- **Record**: `api_config: [pass/fail, error if any]`

### 2.6 Install `/api/qa/admin/export`
- **Source**: `https://raw.githubusercontent.com/jyonah/zo-qa-app/main/routes/api/qa-admin-export.ts`
- **Type**: `api`
- **Record**: `api_export: [pass/fail, error if any]`

### 2.7 Install `/api/qa/admin/reset`
- **Source**: `https://raw.githubusercontent.com/jyonah/zo-qa-app/main/routes/api/qa-admin-reset.ts`
- **Type**: `api`
- **Record**: `api_reset: [pass/fail, error if any]`

### 2.8 Install `/api/qa/admin/merge`
- **Source**: `https://raw.githubusercontent.com/jyonah/zo-qa-app/main/routes/api/qa-admin-merge.ts`
- **Type**: `api`
- **Record**: `api_merge: [pass/fail, error if any]`

**Phase 2 Check-In**:
Report to user:
```
Phase 2 Complete: API Routes (8 routes)
✓ /api/qa/questions: [status]
✓ /api/qa/questions/:id: [status]
✓ /api/qa/questions/:id/vote: [status]
✓ /api/qa/admin/settings: [status]
✓ /api/qa/admin/config: [status]
✓ /api/qa/admin/export: [status]
✓ /api/qa/admin/reset: [status]
✓ /api/qa/admin/merge: [status]

[Show any errors]

Proceed to Phase 3 (Page Routes)?
```

---

## Phase 3: Page Routes Installation

**Goal**: Create all 5 page routes.

**Steps**:

### 3.1 Install `/qa` (Landing Page)
- **Source**: `https://raw.githubusercontent.com/jyonah/zo-qa-app/main/routes/pages/qa-landing.tsx`
- **Type**: `page`
- **Public**: `true`
- **Record**: `page_landing: [pass/fail, error if any]`

### 3.2 Install `/qa/submit`
- **Source**: `https://raw.githubusercontent.com/jyonah/zo-qa-app/main/routes/pages/qa-submit.tsx`
- **Type**: `page`
- **Public**: `true`
- **Record**: `page_submit: [pass/fail, error if any]`

### 3.3 Install `/qa/vote`
- **Source**: `https://raw.githubusercontent.com/jyonah/zo-qa-app/main/routes/pages/qa-vote.tsx`
- **Type**: `page`
- **Public**: `true`
- **Record**: `page_vote: [pass/fail, error if any]`

### 3.4 Install `/qa/tv`
- **Source**: `https://raw.githubusercontent.com/jyonah/zo-qa-app/main/routes/pages/qa-tv.tsx`
- **Type**: `page`
- **Public**: `true`
- **Record**: `page_tv: [pass/fail, error if any]`

### 3.5 Install `/qa/admin`
- **Source**: `https://raw.githubusercontent.com/jyonah/zo-qa-app/main/routes/pages/qa-admin.tsx`
- **Type**: `page`
- **Public**: `true`
- **Record**: `page_admin: [pass/fail, error if any]`

**Phase 3 Check-In**:
Report to user:
```
Phase 3 Complete: Page Routes (5 routes)
✓ /qa: [status]
✓ /qa/submit: [status]
✓ /qa/vote: [status]
✓ /qa/tv: [status]
✓ /qa/admin: [status]

[Show any errors]

Proceed to Phase 4 (Page Verification)?
```

---

## Phase 4: Page Verification

**Goal**: Verify all pages load without errors.

**Steps**: For each page, fetch the HTML and check for errors.

### 4.1 Verify Landing Page
```bash
curl -s "https://[your-handle].zo.space/qa" | head -100
```
- **Check**: Page returns HTML, no 404/500 errors
- **Screenshot**: If possible, capture screenshot
- **Record**: `verify_landing: [pass/fail, URL, screenshot path]`

### 4.2 Verify Submit Page
```bash
curl -s "https://[your-handle].zo.space/qa/submit" | head -100
```
- **Record**: `verify_submit: [pass/fail, URL, screenshot path]`

### 4.3 Verify Vote Page
```bash
curl -s "https://[your-handle].zo.space/qa/vote" | head -100
```
- **Record**: `verify_vote: [pass/fail, URL, screenshot path]`

### 4.4 Verify TV Page
```bash
curl -s "https://[your-handle].zo.space/qa/tv" | head -100
```
- **Record**: `verify_tv: [pass/fail, URL, screenshot path]`

### 4.5 Verify Admin Page
```bash
curl -s "https://[your-handle].zo.space/qa/admin" | head -100
```
- **Record**: `verify_admin: [pass/fail, URL, screenshot path]`

### 4.6 Check for Space Errors
```bash
# Use Zo's get_space_errors() tool or check logs
```
- **Record**: `space_errors: [list of errors or "none"]`

**Phase 4 Check-In**:
Report to user:
```
Phase 4 Complete: Page Verification
✓ Landing (/qa): [status] - [URL]
✓ Submit (/qa/submit): [status] - [URL]
✓ Vote (/qa/vote): [status] - [URL]
✓ TV (/qa/tv): [status] - [URL]
✓ Admin (/qa/admin): [status] - [URL]

Space errors: [none / count]

[Show screenshots if captured]

Proceed to Phase 5 (Basic Functionality Test)?
```

---

## Phase 5: Basic Functionality Test

**Goal**: Test core features (submit, list, vote, display).

**Steps**:

### 5.1 Submit a Test Question
```bash
curl -X POST "https://[your-handle].zo.space/api/qa/questions?event=test" \
  -H "Content-Type: application/json" \
  -d '{"text":"This is a test question from the testing process","submitter_name":"Zo Test Bot"}'
```
- **Expected**: `{"ok":true,"question":{...}}`
- **Record**: `test_submit: [pass/fail, response]`

### 5.2 List Questions
```bash
curl -s "https://[your-handle].zo.space/api/qa/questions?event=test"
```
- **Check**: Response includes the test question
- **Record**: `test_list: [pass/fail, question count, response snippet]`

### 5.3 Vote on Test Question
```bash
# Extract question ID from step 5.2, then:
curl -X POST "https://[your-handle].zo.space/api/qa/questions/[question-id]/vote?event=test"
```
- **Expected**: `{"ok":true,"votes":1}`
- **Record**: `test_vote: [pass/fail, response]`

### 5.4 Verify Vote Count
```bash
curl -s "https://[your-handle].zo.space/api/qa/questions?event=test"
```
- **Check**: Test question now has 1 vote
- **Record**: `test_vote_verify: [pass/fail, vote count]`

### 5.5 Check TV Wall
```bash
curl -s "https://[your-handle].zo.space/qa/tv?event=test" | grep -i "test question"
```
- **Check**: Test question appears in TV wall HTML
- **Record**: `test_tv_wall: [pass/fail]`

**Phase 5 Check-In**:
Report to user:
```
Phase 5 Complete: Basic Functionality
✓ Submit question: [status]
✓ List questions: [status] - [count] questions
✓ Vote on question: [status]
✓ Verify vote count: [status] - [count] votes
✓ TV wall display: [status]

[Show any API responses]

Proceed to Phase 6 (Admin Functionality Test)?
```

---

## Phase 6: Admin Functionality Test

**Goal**: Test admin features (settings, export).

**Steps**:

### 6.1 Get Event Settings
```bash
curl -s "https://[your-handle].zo.space/api/qa/admin/settings?event=test"
```
- **Expected**: JSON with `submissionsEnabled`, `votingEnabled`, etc.
- **Record**: `admin_get_settings: [pass/fail, response]`

### 6.2 Update Event Settings
```bash
curl -X POST "https://[your-handle].zo.space/api/qa/admin/settings?event=test" \
  -H "Content-Type: application/json" \
  -d '{"submissionsEnabled":false,"votingEnabled":true}'
```
- **Expected**: `{"ok":true}`
- **Record**: `admin_update_settings: [pass/fail, response]`

### 6.3 Get Event Config (Branding)
```bash
curl -s "https://[your-handle].zo.space/api/qa/admin/config?event=test"
```
- **Expected**: JSON with `title`, `brandName`, etc.
- **Record**: `admin_get_config: [pass/fail, response]`

### 6.4 Export Data (JSON)
```bash
curl -s "https://[your-handle].zo.space/api/qa/admin/export?event=test&format=json"
```
- **Expected**: JSON array of questions
- **Record**: `admin_export_json: [pass/fail, question count]`

### 6.5 Export Data (CSV)
```bash
curl -s "https://[your-handle].zo.space/api/qa/admin/export?event=test&format=csv"
```
- **Expected**: CSV with headers
- **Record**: `admin_export_csv: [pass/fail, row count]`

### 6.6 Export Data (Markdown)
```bash
curl -s "https://[your-handle].zo.space/api/qa/admin/export?event=test&format=md"
```
- **Expected**: Markdown document
- **Record**: `admin_export_md: [pass/fail, snippet]`

**Phase 6 Check-In**:
Report to user:
```
Phase 6 Complete: Admin Functionality
✓ Get settings: [status]
✓ Update settings: [status]
✓ Get config: [status]
✓ Export JSON: [status] - [count] questions
✓ Export CSV: [status] - [count] rows
✓ Export Markdown: [status]

[Show any API responses]

Proceed to Phase 7 (Cleanup & Report)?
```

---

## Phase 7: Cleanup & Report Generation

**Goal**: Clean up test data and generate final report.

**Steps**:

### 7.1 Reset Test Event
```bash
curl -X POST "https://[your-handle].zo.space/api/qa/admin/reset?event=test" \
  -H "Content-Type: application/json" \
  -d '{"scope":"event"}'
```
- **Record**: `cleanup_reset: [pass/fail]`

### 7.2 Generate Final Report

Create a report file with all recorded results:

```bash
cat > /home/workspace/qa-app/TEST_REPORT.md << 'EOF'
# Zo Q&A App — Installation Test Report

**Test Date**: [timestamp]
**Zo Instance**: [handle].zo.computer
**Tester**: Zo Agent

---

## Summary

**Overall Status**: [PASS/FAIL/PARTIAL]
- **Total Steps**: 32
- **Passed**: [count]
- **Failed**: [count]
- **Skipped**: [count]

---

## Phase Results

### Phase 1: Pre-Flight Checks
| Step | Status | Details |
|------|--------|---------|
| Zo Space access | [pass/fail] | [details] |
| Route conflicts | [pass/fail] | [details] |
| GitHub access | [pass/fail] | [details] |
| Data directory | [pass/fail] | [details] |

### Phase 2: API Routes (8 routes)
| Route | Status | Error |
|-------|--------|-------|
| /api/qa/questions | [pass/fail] | [error or none] |
| /api/qa/questions/:id | [pass/fail] | [error or none] |
| /api/qa/questions/:id/vote | [pass/fail] | [error or none] |
| /api/qa/admin/settings | [pass/fail] | [error or none] |
| /api/qa/admin/config | [pass/fail] | [error or none] |
| /api/qa/admin/export | [pass/fail] | [error or none] |
| /api/qa/admin/reset | [pass/fail] | [error or none] |
| /api/qa/admin/merge | [pass/fail] | [error or none] |

### Phase 3: Page Routes (5 routes)
| Route | Status | Error |
|-------|--------|-------|
| /qa | [pass/fail] | [error or none] |
| /qa/submit | [pass/fail] | [error or none] |
| /qa/vote | [pass/fail] | [error or none] |
| /qa/tv | [pass/fail] | [error or none] |
| /qa/admin | [pass/fail] | [error or none] |

### Phase 4: Page Verification
| Page | Status | URL | Screenshot |
|------|--------|-----|------------|
| Landing | [pass/fail] | [URL] | [path or N/A] |
| Submit | [pass/fail] | [URL] | [path or N/A] |
| Vote | [pass/fail] | [URL] | [path or N/A] |
| TV | [pass/fail] | [URL] | [path or N/A] |
| Admin | [pass/fail] | [URL] | [path or N/A] |

**Space Errors**: [none or list]

### Phase 5: Basic Functionality
| Test | Status | Details |
|------|--------|---------|
| Submit question | [pass/fail] | [response snippet] |
| List questions | [pass/fail] | [count] questions |
| Vote on question | [pass/fail] | [vote count] |
| Verify vote | [pass/fail] | [final vote count] |
| TV wall display | [pass/fail] | [details] |

### Phase 6: Admin Functionality
| Test | Status | Details |
|------|--------|---------|
| Get settings | [pass/fail] | [response snippet] |
| Update settings | [pass/fail] | [response snippet] |
| Get config | [pass/fail] | [response snippet] |
| Export JSON | [pass/fail] | [count] questions |
| Export CSV | [pass/fail] | [count] rows |
| Export Markdown | [pass/fail] | [snippet] |

### Phase 7: Cleanup
| Step | Status |
|------|--------|
| Reset test event | [pass/fail] |

---

## Errors Encountered

[List all errors with full details, including:
- Step where error occurred
- Error message
- HTTP status code (if applicable)
- Request/response details
- Suggested fix (if known)]

---

## Timing

| Phase | Duration |
|-------|----------|
| Phase 1: Pre-Flight | [time] |
| Phase 2: API Routes | [time] |
| Phase 3: Page Routes | [time] |
| Phase 4: Verification | [time] |
| Phase 5: Basic Test | [time] |
| Phase 6: Admin Test | [time] |
| Phase 7: Cleanup | [time] |
| **Total** | [total time] |

---

## Screenshots

[List paths to all screenshots, organized by page]

---

## API Response Samples

### Submit Question Response
```json
[paste response]
```

### List Questions Response
```json
[paste response]
```

### Get Settings Response
```json
[paste response]
```

---

## Recommendations

[If any issues were found, list recommendations for fixes]

---

## Next Steps

If all tests passed:
- The Q&A app is ready for use
- Visit `/qa/admin?event=your-event` to configure
- Share `/qa/submit?event=your-event` with attendees

If tests failed:
- Share this report with the app author
- Use cleanup command (below) to remove installation

---

## Cleanup Command

To completely remove the Q&A app installation:

```bash
# Remove all routes
# (Use Zo's delete_space_route tool for each route)

# Remove data directory
rm -rf /home/workspace/qa-app

# Remove this report
rm /home/workspace/qa-app/TEST_REPORT.md
```

Or ask your Zo Agent:
```
Uninstall the Zo Q&A app completely
```

EOF
```

- **Record**: `report_generated: [pass/fail, path]`

### 7.3 Display Report to User

Show the generated report and ask user to share it with the app author.

**Phase 7 Check-In**:
Report to user:
```
Phase 7 Complete: Cleanup & Report

✓ Test event reset: [status]
✓ Report generated: [status]

📄 Report saved to: /home/workspace/qa-app/TEST_REPORT.md

[Display full report or summary]

---

## FINAL STATUS: [PASS/FAIL/PARTIAL]

[If FAIL or PARTIAL, show cleanup command]

To share this report with the app author:
1. Download the report file
2. Email to: [author email]
3. Or create a GitHub issue: https://github.com/jyonah/zo-qa-app/issues

Thank you for testing!
```

---

## Cleanup Command (For Failures)

If the user wants to remove the installation:

```bash
# Tell your Zo Agent:
"Uninstall the Zo Q&A app and remove all data"
```

The Zo Agent should:
1. Delete all `/qa/*` and `/api/qa/*` routes
2. Remove `/home/workspace/qa-app` directory
3. Confirm cleanup is complete

---

## Timeout Handling

If approaching the 15-minute timeout:

1. **Stop current phase** after completing the current step
2. **Skip to Phase 7** (Report Generation)
3. **Mark incomplete steps** as "skipped" with reason "timeout"
4. **Generate partial report** with all completed results
5. **Inform user** that testing was incomplete due to timeout

The report should clearly indicate which phases were skipped.

---

## Notes for Zo Agents

- **No personas required**: This guide assumes a default Zo Agent configuration
- **Check in frequently**: User should approve each phase before proceeding
- **Record everything**: Every step's result should be captured for the report
- **Continue on error**: Don't stop if one step fails; record and continue
- **Be verbose in errors**: Include full error messages, stack traces, and HTTP responses
- **Screenshots are valuable**: If you can capture screenshots, do so for every page
- **Timing matters**: Record how long each phase takes

---

## Questions for User

If you encounter ambiguous situations, ask the user:

1. **Route conflict found**: "Found existing route at [path]. Should I overwrite it or skip?"
2. **GitHub access fails**: "Cannot reach GitHub. Should I try alternative sources or abort?"
3. **Page shows error**: "Page [URL] shows an error. Should I continue testing or investigate first?"
4. **API returns unexpected response**: "API [endpoint] returned unexpected response. Should I continue or debug?"

---

**End of Testing Guide**
