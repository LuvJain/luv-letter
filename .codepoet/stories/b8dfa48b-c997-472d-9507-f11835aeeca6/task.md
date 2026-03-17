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

# Your Task: Admins can create and edit schedules with calendar date picker and recipient management

## Description
Create React components for admins to create and edit message schedules. The interface includes a form for schedule details, a calendar for date/time selection, and a recipient list with personalization data.

## Acceptance Criteria
- Schedule form requires template selection, channel, and scheduled_at; validates scheduledAt is in future
- Date-time picker displays calendar and prevents selection of past dates
- CSV recipient upload accepts files with recipient_id, phone_number, address, and personalization fields
- Phone numbers are validated using existing SMS validation rules; invalid numbers show error
- Recipient list displays uploaded data in table format with row count
- Schedule creation submits to API endpoint and shows success/error message
- Redux state persists schedule data across form steps

## Implementation Notes
- Create schedule-slice.js Redux slice with state: schedules (array), currentSchedule (object), loading (bool), error (string), recipients (array); actions: setSchedules, setCurrentSchedule, setLoading, setError, addSchedule, updateSchedule, deleteSchedule, setRecipients
- Create schedule-form.jsx component with fields: template dropdown, channel radio buttons (sms/letter/both), scheduled_at datetime input, recipient count display; validate template is selected and scheduledAt is in future before submit
- Create date-time-picker.jsx component using HTML5 datetime-local input or a calendar library; ensure it captures timezone-aware datetime; display current selection and allow clearing
- Create recipient-uploader.jsx component that accepts CSV file upload with columns: recipient_id, phone_number (for SMS), address (for letters), firstName, lastName, customField1, etc.; parse CSV and validate phone numbers using existing validation from SMS intent
- Create recipient-list.jsx component that displays uploaded recipients in a table with columns: recipient_id, phone_number, address, personalization fields; show row count and allow removing individual rows
- Create schedule-creator.jsx as parent component managing the full schedule creation flow: template selection → channel selection → date/time picker → recipient upload → review → submit; use Redux to manage state across steps
- On schedule submit: call schedule-service.createSchedule() with templateId, scheduledAt, channel, and recipients array; dispatch Redux actions to update state; show success message and redirect to schedule list

## Completion
Verify your changes work — run relevant tests or checks appropriate for this project.

Then create `.codepoet/stories/b8dfa48b-c997-472d-9507-f11835aeeca6/done.json` with this exact structure:
```json
{
  "status": "completed",
  "summary": "<brief summary of what you did>",
  "files_changed": ["list", "of", "files"]
}
```
IMPORTANT: The file MUST be at exactly `.codepoet/stories/b8dfa48b-c997-472d-9507-f11835aeeca6/done.json`.
Do not create this file until you are fully done.
Do NOT perform any git operations (no git add, commit, or push).