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

# Your Task: Admins can create and manage templates with variable placeholders

## Description
Create React components for admins to create, edit, and manage message templates with support for personalization variables. Templates are reusable across multiple schedules.

## Acceptance Criteria
- Admins can create templates with name, content, channel, and variable placeholders
- Template form shows preview of content with {{variableName}} syntax highlighted
- Variable picker displays available fields and inserts {{variableName}} into content on click
- Template list displays all templates with name, channel, and created_at columns
- Admins can edit and delete templates; changes persist to database
- Redux state manages template data; loading and error states display appropriately

## Implementation Notes
- Create template-slice.js Redux slice with state: templates (array), loading (bool), error (string), selectedTemplate (object); actions: setTemplates, setLoading, setError, selectTemplate, addTemplate, updateTemplate, deleteTemplate
- Create template-service.js with functions: fetchTemplates(), createTemplate(name, content, channel, variables), updateTemplate(id, updates), deleteTemplate(id); use async/await with try-catch following existing error pattern
- Create template-form.jsx component with inputs for name, channel dropdown (sms/letter/both), content textarea, and variable picker; show preview of content with variable placeholders highlighted
- Create variable-picker.jsx component that displays available variables (firstName, lastName, customField1, etc.) as buttons; clicking inserts {{variableName}} into content textarea
- Create template-list.jsx component that displays all templates in a table with columns: name, channel, created_at, actions (edit/delete); use Tailwind for styling following existing component patterns
- Create template-manager.jsx as parent component that manages template CRUD flow; fetch templates on mount using useEffect, dispatch Redux actions on create/update/delete, show loading state and error messages
- Integrate template-manager into admin dashboard navigation; add route or sidebar link to access template management

## Completion
Verify your changes work — run relevant tests or checks appropriate for this project.

Then create `.codepoet/stories/d5470402-f47e-4efc-89f5-32465d45a862/done.json` with this exact structure:
```json
{
  "status": "completed",
  "summary": "<brief summary of what you did>",
  "files_changed": ["list", "of", "files"]
}
```
IMPORTANT: The file MUST be at exactly `.codepoet/stories/d5470402-f47e-4efc-89f5-32465d45a862/done.json`.
Do not create this file until you are fully done.
Do NOT perform any git operations (no git add, commit, or push).