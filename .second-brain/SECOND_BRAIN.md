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

## Story: Phase 1: Create authentication data models and API endpoints (completed 2026-02-23T19:33:33Z)
- **Learned**: Implemented backend credential validation system with secure password reset token generation for SMS delivery
- **Technologies**: Backend framework (unspecified), Token generation library, SMS integration

## Story: Phase 2: Build authentication context and login UI components (completed 2026-02-23T19:40:31Z)
- **Learned**: Implemented client-side authentication system with login form, session persistence via localStorage, and logout functionality
- **Technologies**: JavaScript, HTML/CSS, localStorage API

## Story: Phase 3: Integrate authentication into app routing and protect routes (completed 2026-02-23T19:45:03Z)
- **Learned**: Implemented route protection mechanism that enforces authentication across the application, redirecting all unauthenticated users to a login screen
- **Technologies**: React, React Router, Authentication Context/State Management
