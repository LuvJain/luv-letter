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
- **Phase 2: Create backend API endpoints for schedule CRUD operations** — Built full CRUD API for message schedules: created schedule-service.js with Supabase functions (createSchedule, getSchedule, listSchedules, updateSchedule, deleteSchedule, bulkUpdateSchedules), six serverless endpoints (create, list, get, update, bulk-update, delete) with validation and error handling, a server-side Supabase client for API routes, and fixed ESLint config to support Node.js globals in api/ directory.
  Files: api/lib/supabase.js, api/lib/schedule-service.js, api/schedules/create.js, api/schedules/list.js, api/schedules/get.js, api/schedules/update.js, api/schedules/bulk-update.js, api/schedules/delete.js, eslint.config.js
- **Phase 3: Build message template management interface** — Built template management feature with Redux state management: created template-service.js for Supabase CRUD operations, template-slice.js Redux slice with full state management (templates, loading, error, selectedTemplate), variable-picker.jsx with clickable variable buttons that insert {{variableName}} placeholders, template-form.jsx with name/channel/content inputs and live preview with highlighted variables, template-list.jsx displaying templates with channel badges and edit/delete actions, and template-manager.jsx as the parent orchestrator. Integrated into App.jsx as a new 'templates' tab in bottom navigation. Set up Redux store with Provider wrapper in main.jsx.
  Files: package.json, src/main.jsx, src/App.jsx, src/store/index.js, src/store/template-slice.js, src/services/template-service.js, src/components/variable-picker.jsx, src/components/template-form.jsx, src/components/template-list.jsx, src/components/template-manager.jsx
- **Phase 3: Build schedule creation and editing interface** — Built admin schedule creation interface with multi-step wizard (details, recipients, review). Created Redux schedule-slice with full state management, frontend schedule-service for Supabase CRUD, date-time-picker with past-date prevention, CSV recipient-uploader with phone validation using existing SMS rules, recipient-list table with row removal, schedule-form with template dropdown and channel selection, and schedule-creator parent component orchestrating the full flow. Integrated into App.jsx as a new 'schedules' tab.
  Files: src/store/schedule-slice.js, src/services/schedule-service.js, src/components/date-time-picker.jsx, src/components/recipient-uploader.jsx, src/components/recipient-list.jsx, src/components/schedule-form.jsx, src/components/schedule-creator.jsx, src/store/index.js, src/App.jsx

# Your Task: Admins can view, filter, and bulk-edit schedules with date/time changes

## Description
Create React components to display all schedules in a table with filtering, sorting, and bulk editing capabilities. Admins can reschedule multiple messages at once.

## Acceptance Criteria
- Schedule table displays all schedules with id, template name, channel, scheduled_at, status, and recipient count
- Filters by status and channel work correctly; table updates when filters change
- Date range filter shows schedules within selected date range
- Pagination displays 20 schedules per page with next/previous navigation
- Bulk edit modal allows selecting multiple schedules and changing scheduled_at for all at once
- Bulk edit validates new datetime is in future before submitting
- Delete action soft-deletes schedule (sets status to 'cancelled') and refreshes table

## Implementation Notes
- Create schedule-table.jsx component that displays schedules in a table with columns: id, template name, channel, scheduled_at, status, recipient count, actions (edit/delete); add checkbox column for bulk selection
- Create schedule-filters.jsx component with filters: status dropdown (pending/scheduled/sent/failed/cancelled), channel checkboxes (sms/letter/both), date range picker; apply filters on change and fetch filtered schedules
- Create bulk-edit-modal.jsx component that opens when bulk edit is triggered; show count of selected schedules; provide datetime input to set new scheduled_at for all selected; validate new datetime is in future; show confirmation before applying
- Create schedule-list.jsx as parent component managing table state: selected schedules (array), filters (object), pagination (limit/offset), loading state; fetch schedules on mount and when filters change using schedule-service.listSchedules()
- Implement pagination with limit (default 20) and offset; show total count and current page; add next/previous buttons
- On bulk edit submit: call schedule-service.bulkUpdateSchedules(selectedIds, {scheduled_at: newDateTime}); show success message with count of updated schedules; refresh table
- Add delete action that calls schedule-service.deleteSchedule(id); show confirmation modal before deleting; refresh table after delete

## Completion
Verify your changes work — run relevant tests or checks appropriate for this project.

Then create `.codepoet/stories/4833ffa3-928f-4003-9e47-67269eb5e430/done.json` with this exact structure:
```json
{
  "status": "completed",
  "summary": "<brief summary of what you did>",
  "files_changed": ["list", "of", "files"]
}
```
IMPORTANT: The file MUST be at exactly `.codepoet/stories/4833ffa3-928f-4003-9e47-67269eb5e430/done.json`.
Do not create this file until you are fully done.
Do NOT perform any git operations (no git add, commit, or push).