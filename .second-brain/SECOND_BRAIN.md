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

## Key Utilities
- `src/lib/supabase.ts` - Supabase client configuration
- `src/components/ui/` - Shared UI components (Shadcn)
- `src/app/api/` - API route handlers
- `src/hooks/useAuth.ts` - Authentication hook
- `src/middleware.ts` - NextAuth v5 stateless session validation (MUST use secure cookies)
- `src/lib/auth.ts` - NextAuth configuration with JWT strategy
- `src/store/useEventStore.ts` - Zustand store for event management
- `src/lib/rate-limit.ts` - Rate limiting utility using upstash/redis
- `src/lib/email.ts` - Resend email service wrapper
- `src/hooks/useToast.ts` - Toast notification hook (wraps sonner)

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

## Story: Phase 1: Set up SMS message data model and Redux state management (completed 2026-02-19T20:10:43Z)
- **Learned**: Designed Redux state structure to manage SMS messages with scheduling capabilities and real-time status tracking
- **Technologies**: Redux, JavaScript, State Management

## Story: Phase 2: Implement phone number validation for North America and Europe (completed 2026-02-19T20:11:24Z)
- **Learned**: Implemented phone number validation and formatting system supporting North American and European regional formats with standardized output
- **Technologies**: JavaScript/TypeScript, Regex, Internationalization

## Story: Phase 3: Create secure credential storage for Twilio API keys (completed 2026-02-19T20:11:53Z)
- **Learned**: Implemented secure server-side Twilio credential management to prevent exposure of sensitive API keys in client-side code
- **Technologies**: Twilio SDK, Backend API, Environment Variables

## Story: Phase 4: Build serverless API endpoint for SMS scheduling with Twilio integration (completed 2026-02-19T20:14:19Z)
- **Learned**: Built a serverless endpoint that accepts SMS requests and schedules message delivery through Twilio's API
- **Technologies**: Serverless Framework, Twilio SDK, Node.js/Python, Cloud Functions

## Story: Phase 5: Implement message status tracking with Twilio webhooks (completed 2026-02-19T20:15:02Z)
- **Learned**: Implemented Twilio webhook integration to capture and update message delivery status in real-time
- **Technologies**: Twilio API, Webhooks, HTTP, Message Status Callbacks

## Story: Phase 6: Build offline message queuing and sync mechanism (completed 2026-02-19T20:15:34Z)
- **Learned**: Implemented offline-first message queuing system that persists messages locally and automatically syncs when network connectivity is restored
- **Technologies**: JavaScript/TypeScript, Local Storage/IndexedDB, Event Listeners, Promise-based async

## Story: Phase 7: Create SMS message form component with scheduling UI (completed 2026-02-19T20:16:03Z)
- **Learned**: Implemented SMS message composition and scheduling functionality with a user-friendly form interface
- **Technologies**: JavaScript/TypeScript, React, Form UI components, SMS API integration
