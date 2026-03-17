# Project
Send personalized messages to people through multiple channels—combining handwritten letters with SMS notifications—to help users maintain meaningful connections at scale. Deliver heartfelt communications that blend the intimacy of physical mail with the immediacy of text messaging.
Stack: JavaScript | React | Tailwind CSS | Vite
Patterns:
- Error Handling: Basic try-catch blocks in async API handlers with early return pattern for validation errors. HTTP status codes used to indicate error types (405 for method not allowed, 400 for missing fields, 500 for server errors).
- Async Patterns: Async/await used in API handlers and useEffect hooks for asynchronous operations. Synchronous localStorage operations used for data persistence without explicit async handling.
- File Organization: Modular structure with separation of concerns: src/components/ for React components, src/utils/ for utility functions (storage, email templates), api/ for serverless API handlers, src/main.jsx as entry point.
- Code Style: ES6+ syntax with arrow functions, destructuring, and template literals. Descriptive variable and function names. Tailwind CSS classes for styling. Lowercase kebab-case for component names and file names.
- Authentication: Environment variable-based API key authentication for third-party services
- Logging: Basic console.error for error logging in API handlers
- State Management: React hooks (useState, useEffect) for local component state; utility functions for data persistence via storage module

# Goal: Admin Message Scheduling Interface
Build a built-in scheduling interface within the React admin dashboard to replace Google Sheets for managing personalized message scheduling (handwritten letters and SMS). The system must allow admins to create, edit, and manage message schedules with full CRUD operations, coordinate message delivery timing, and integrate tightly with existing SMS scheduling services. The interface should provide forms, calendars, and tables for schedule management, with data persisted in a backend database. While Google Sheets integration is mentioned as a constraint (data source), the primary goal is to provide a superior UX through a custom-built scheduling tool that eliminates external API dependencies and enables features like bulk editing and templates. The solution should be performant and may require export capabilities for data analysis in external tools.

## Done
- **Phase 1: Set up message schedule database schema** — Created Supabase PostgreSQL migration with three tables (message_templates, message_schedules, schedule_recipients), two enum types (schedule_status, delivery_channel), composite indexes for efficient queries, foreign keys with CASCADE deletes, timestamptz columns, and auto-update triggers for updated_at. Also added Supabase client configuration.
  Files: supabase/migrations/20260303000000_create_scheduling_tables.sql, src/lib/supabase.js

# Your Task: API endpoints support full CRUD for schedules with validation and error handling

## Description
Build serverless API endpoints to handle creating, reading, updating, and deleting message schedules. These endpoints will be called by the React admin dashboard.

## Acceptance Criteria
- POST /api/schedules/create accepts templateId, scheduledAt, channel, and recipients; validates all required fields; returns 201 with created schedule
- GET /api/schedules/list supports filtering by status and channel; returns paginated results with totalCount
- GET /api/schedules/get/:id returns 404 if schedule not found; returns 200 with schedule object if found
- PUT /api/schedules/update/:id allows updating scheduled_at, status, and channel only; validates scheduledAt is in future
- POST /api/schedules/bulk-update accepts array of scheduleIds and updates; updates only scheduled_at and status fields
- DELETE /api/schedules/delete/:id soft-deletes by setting status to 'cancelled'; returns 200 with deleted schedule

## Implementation Notes
- Create schedule-service.js with functions: createSchedule(templateId, scheduledAt, channel, recipients), getSchedule(scheduleId), listSchedules(filters), updateSchedule(scheduleId, updates), deleteSchedule(scheduleId), bulkUpdateSchedules(scheduleIds, updates)
- In create.js endpoint: validate required fields (templateId, scheduledAt, channel), check scheduledAt is in future, validate channel is 'sms', 'letter', or 'both', return 400 for validation errors, return 201 with schedule object on success
- In list.js endpoint: support query filters (status, channel, dateRange), use pagination with limit/offset, return 200 with array of schedules and total count
- In update.js endpoint: allow updating scheduled_at, status, and channel fields only, validate new scheduled_at is in future if changed, return 404 if schedule not found, return 200 with updated schedule
- In bulk-update.js endpoint: accept array of scheduleIds and updates object, validate all scheduleIds exist before updating any, update only scheduled_at and status fields, return 200 with count of updated records
- In delete.js endpoint: soft-delete by setting status to 'cancelled' instead of removing record, return 200 with deleted schedule object, return 404 if not found
- Use try-catch blocks in all endpoints with console.error for server-side logging, follow existing error handling pattern from SMS scheduling intent

## Completion
Verify your changes work — run relevant tests or checks appropriate for this project.

Then create `.codepoet/stories/2e69c59b-0634-4ace-b384-1b3c6c72025f/done.json` with this exact structure:
```json
{
  "status": "completed",
  "summary": "<brief summary of what you did>",
  "files_changed": ["list", "of", "files"]
}
```
IMPORTANT: The file MUST be at exactly `.codepoet/stories/2e69c59b-0634-4ace-b384-1b3c6c72025f/done.json`.
Do not create this file until you are fully done.
Do NOT perform any git operations (no git add, commit, or push).