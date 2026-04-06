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

# Goal: Automated AWS Kiro Update Newsletter
Build an automated newsletter system that monitors official AWS channels (website, YouTube, documentation) for Kiro product updates and feature announcements, then compiles and sends digestible summaries to a subscriber list. This ensures teams stay current on Kiro changes without manual monitoring or third-party noise.

# Your Task: Set up scrapers/watchers for AWS official channels (aws.amazon.com product pages, AWS YouTube channel, Kiro documentation sites) to detect new Kiro-related announcements, blog posts, and videos. Extract relevant content while filtering for first-party sources only.

## Description
Set up scrapers/watchers for AWS official channels (aws.amazon.com product pages, AWS YouTube channel, Kiro documentation sites) to detect new Kiro-related announcements, blog posts, and videos. Extract relevant content while filtering for first-party sources only.

## Acceptance Criteria
- System successfully detects and captures new Kiro announcements from AWS official website, YouTube channel, and documentation within 24 hours of publication
- Generated newsletters contain only first-party AWS/Amazon/Kiro content with no third-party sources included

## Completion
Verify your changes work — run relevant tests or checks appropriate for this project.

Then create `.codepoet/stories/7b287880-2264-47b0-b881-6fca09030892/done.json` with this exact structure:
```json
{
  "status": "completed",
  "summary": "<brief summary of what you did>",
  "files_changed": ["list", "of", "files"]
}
```
IMPORTANT: The file MUST be at exactly `.codepoet/stories/7b287880-2264-47b0-b881-6fca09030892/done.json`.
Do not create this file until you are fully done.
Do NOT perform any git operations (no git add, commit, or push).