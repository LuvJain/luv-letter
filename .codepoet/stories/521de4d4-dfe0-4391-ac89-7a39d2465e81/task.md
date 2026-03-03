# Task: Database schema ready to store schedules, templates, and delivery metadata

## Description
Create database tables to store message schedules, templates, and delivery coordination data. This establishes the persistent data layer for all scheduling operations.

## Acceptance Criteria
- All three tables exist in database with correct column types and constraints
- Composite indexes on (scheduled_at, status) and (schedule_id, delivery_status) are created
- Foreign key relationships enforce referential integrity with CASCADE deletes
- Status and channel columns use enum types to prevent invalid values
- Timestamp columns use timestamptz type for timezone-aware scheduling

## Implementation Notes
- Create message_schedules table with columns: id (uuid primary key), template_id (uuid foreign key), scheduled_at (timestamptz), status (text default 'pending'), channel (text: 'sms' or 'letter' or 'both'), created_at (timestamptz), updated_at (timestamptz), created_by (text for admin identifier)
- Create message_templates table with columns: id (uuid primary key), name (text), content (text), channel (text), variables (jsonb for personalization fields), created_at (timestamptz), updated_at (timestamptz)
- Create schedule_recipients table with columns: id (uuid primary key), schedule_id (uuid foreign key), recipient_id (text), phone_number (text nullable), address (jsonb nullable for letter delivery), personalization_data (jsonb), delivery_status (text default 'pending'), delivered_at (timestamptz nullable), created_at (timestamptz)
- Add composite index on (scheduled_at, status) for efficient pending-message queries
- Add index on schedule_recipients (schedule_id, delivery_status) for bulk status updates
- Add foreign key constraints with ON DELETE CASCADE from schedules to recipients and templates
- Create enum types for status ('pending', 'scheduled', 'sent', 'failed', 'cancelled') and channel ('sms', 'letter', 'both')

## When You're Done
When you have completed all acceptance criteria, create the file `.codepoet/stories/521de4d4-dfe0-4391-ac89-7a39d2465e81/done.json` with this exact structure:
```json
{
  "status": "completed",
  "summary": "<brief summary of what you did>",
  "files_changed": ["list", "of", "files"]
}
```
IMPORTANT: The file MUST be at exactly `.codepoet/stories/521de4d4-dfe0-4391-ac89-7a39d2465e81/done.json`.
Do NOT create this file until you are fully done.
Do NOT perform any git operations (no git add, commit, or push).