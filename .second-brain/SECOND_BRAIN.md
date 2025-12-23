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

---

# Evolution

## Story: Initial Project Setup (completed 2025-12-15T10:00:00Z)

- **Created**: `src/app/layout.tsx`, `src/app/page.tsx`, `tailwind.config.ts`
- **Learned**: Next.js 14 app router conventions, TailwindCSS configuration
- **Technologies**: Next.js, TailwindCSS, TypeScript

## Story: Authentication Flow (completed 2025-12-18T14:00:00Z)

- **Created**: `src/lib/supabase.ts`, `src/hooks/useAuth.ts`, `src/app/login/page.tsx`
- **Modified**: `src/app/layout.tsx` (added auth provider)
- **Learned**: Supabase auth with Next.js middleware, session management
- **Technologies**: Supabase Auth, Next.js middleware

## Story: Landing Page Design (completed 2025-12-20T16:30:00Z)

- **Created**: `src/components/Hero.tsx`, `src/components/Features.tsx`
- **Learned**: Framer Motion animations, responsive design patterns
- **Technologies**: Framer Motion, TailwindCSS

