---
version: "2.0"
---

# Intelligence

## Tech Stack
- **Language**: TypeScript, JavaScript
- **Framework**: Next.js 14, React 18
- **Styling**: TailwindCSS, Shadcn/UI
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Vercel
- **Package Manager**: pnpm

## Coding Patterns
- **Error Handling**: Try/catch with toast notifications for user feedback
- **Async Patterns**: React Query for data fetching, Server Components where possible
- **Testing Patterns**: Vitest for unit tests, Playwright for E2E
- **File Organization**: App router with feature-based folder structure
- **Code Style**: ESLint + Prettier, barrel exports, named exports preferred
- **error_handling**: Basic try-catch blocks in async API handlers with early return pattern for validation errors. HTTP status codes used to indicate error types (405 for method not allowed, 400 for missing fields, 500 for server errors).
- **testing_patterns**: Not detected in codebase
- **async_patterns**: Async/await used in API handlers and useEffect hooks for asynchronous operations. Synchronous localStorage operations used for data persistence without explicit async handling.
- **file_organization**: Modular structure with separation of concerns: src/components/ for React components, src/utils/ for utility functions (storage, email templates), api/ for serverless API handlers, src/main.jsx as entry point.
- **code_style**: ES6+ syntax with arrow functions, destructuring, and template literals. Descriptive variable and function names. Tailwind CSS classes for styling. Lowercase kebab-case for component names and file names.
- **authentication**: API key-based authentication using environment variables. Settings component stores apiKey and apiProvider configuration. No user authentication system detected.
- **logging**: Minimal logging with console.error used for server-side errors. No structured logging framework detected.
- **state_management**: React hooks-based state management using useState and useEffect. LocalStorage used for persistent data storage across sessions. Component-level state for form inputs and UI state.
- **leakage_in_user_data**: I want no data leaked for user

## Key Utilities
- `src/app/layout.tsx`
- `src/lib/supabase.ts`
- `src/middleware.ts`
- `src/lib/auth.ts`
- `src/lib/rate-limit.ts`
- `src/lib/email.ts`
- `src/lib/sms.ts`
- `src/app/api/auth/[...nextauth]/route.ts`
- `src/app/page.tsx`
- `tailwind.config.ts`

---

# Evolution

## Story: Initial Project Setup (completed 2025-12-15T10:00:00Z)
- **Created**: `src/app/layout.tsx`, `src/app/page.tsx`, `tailwind.config.ts`
- **Learned**: Next.js 14 app router conventions, TailwindCSS configuration
- **Technologies**: Next.js, TailwindCSS, TypeScript

## Story: Authentication Flow (completed 2025-12-18T14:00:00Z)
- **Created**: `src/lib/supabase.ts`, `src/hooks/useAuth.ts`, `src/app/login/page.tsx`
- **Modified**: `src/app/layout.tsx`
- **Learned**: Supabase auth with Next.js middleware, session management
- **Technologies**: Supabase Auth, Next.js middleware

## Story: Landing Page Design (completed 2025-12-20T16:30:00Z)
- **Created**: `src/components/Hero.tsx`, `src/components/Features.tsx`
- **Learned**: Framer Motion animations, responsive design patterns
- **Technologies**: Framer Motion, TailwindCSS

## Story: Add NextAuth Authentication (completed 2025-12-28T09:15:00Z)
- **Created**: `src/middleware.ts`, `src/lib/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`
- **Modified**: `src/app/layout.tsx`
- **Learned**: NextAuth v5 uses **stateless JWT sessions**, NOT database sessions. Must configure secure HTTP-only cookies. Middleware runs on edge runtime.
- **Technologies**: NextAuth v5, JWT, Edge Runtime

## Story: Event Management with Zustand (completed 2026-01-05T14:20:00Z)
- **Created**: `src/store/useEventStore.ts`, `src/app/events/page.tsx`, `src/components/EventCard.tsx`
- **Modified**: `src/app/api/events/route.ts`
- **Learned**: Zustand provides simpler state management than Redux for small apps. Persist middleware allows localStorage sync. Server Components should fetch directly, not use client stores.
- **Technologies**: Zustand, React Query, Next.js Server Components

## Story: Rate Limiting on Auth Endpoints (completed 2026-01-12T11:45:00Z)
- **Created**: `src/lib/rate-limit.ts`, `src/app/api/auth/rate-limit.ts`
- **Modified**: `src/app/api/auth/[...nextauth]/route.ts`
- **Learned**: Upstash Redis provides serverless-friendly rate limiting. Implemented sliding window algorithm. Rate limit by IP address with fallback to user ID.
- **Technologies**: Upstash Redis, Next.js API Routes

## Story: Email Notifications with Resend (completed 2026-01-18T16:00:00Z)
- **Created**: `src/lib/email.ts`, `src/emails/WelcomeEmail.tsx`, `src/emails/EventInvite.tsx`
- **Modified**: `src/app/api/events/invite/route.ts`
- **Learned**: Resend provides React email templates. Use `@react-email/components` for consistent styling. Always handle email failures gracefully (don't block user flow).
- **Technologies**: Resend, React Email, Next.js API Routes

## Story: Toast Notifications with Sonner (completed 2026-01-25T10:30:00Z)
- **Created**: `src/hooks/useToast.ts`, `src/components/ToastProvider.tsx`
- **Modified**: `src/app/layout.tsx`
- **Learned**: Sonner provides beautiful toast notifications with minimal setup. Custom hook wraps sonner for consistent error/success patterns. Position: bottom-right works best for this app.
- **Technologies**: Sonner, React Hooks

## Story: SMS Notifications (completed 2026-02-01T13:20:00Z)
- **Created**: `src/lib/sms.ts`, `src/app/api/notifications/sms/route.ts`
- **Modified**: `src/app/api/events/invite/route.ts`
- **Learned**: Twilio integration for SMS. Rate limiting critical for SMS to prevent cost overruns. User preference system for notification channels.
- **Technologies**: Twilio, Next.js API Routes
