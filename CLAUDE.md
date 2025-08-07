# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `yarn dev` - Start development server on localhost:3000
- `yarn build` - Build production version
- `yarn start` - Start production server
- `yarn lint` - Run ESLint
- `yarn format` - Format code with Prettier

**Development Workflow:**

- Before staging commits: `yarn lint --fix && yarn format`
- Commit when completing a unit of task
- Use English for commit messages, refer to last 3 commits for style consistency
- Use Yarn as package manager (not npm)


### Core Architecture

**Frontend Stack:**

- Next.js 15 (App Router) with strict TypeScript
- React 19.1
- TypeScript with strict type safety (avoid `any`)
- Tailwind CSS 4
- Shadcn/ui + Atomic Design Pattern for component architecture(shadcn/ui - use `npx shadcn@latest` not deprecated version)


**Backend/Database:**

- Notion API for post datas
- Supabase for database (use Supabase MCP tools, check project ref first)
- Server-side Supabase client: `await createClient()` (async function)
- Use `.overrideTypes<T>()` for multiple data fetching, `.single<T>()` for single data
- Session-based auth using JWT (jose library)
- bcryptjs for password hashing
- Server Actions instead of API routes for backend operations
- Business logic in Server Actions for maintainable frontend

**Key Directory Structure:**

- `src/app/` - Next.js app router pages and server actions (Server Components by default)
- `src/components/` - React components organized by feature (use `.client.tsx` for Client Components)
- `src/lib/` - Core utilities and business logic
- `src/types/` - TypeScript type definitions
- `supabase/migrations/` - Database schema migrations

### Database Integration

**Supabase Setup:**

- Client-side: `src/lib/supabase/client.ts`
- Server-side: `src/lib/supabase/server.ts` (with SSR support)
- Uses environment variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY

### UI System

**Design System:**

- Uses shadcn/ui components with Radix UI primitives
- Tailwind CSS for styling with custom component variants
- `src/components/ui/` contains reusable UI components
- `components.json` configures component generation


### Environment Variables Required

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `NOTION_API_KEY` - Notion API key

### Code Quality Guidelines

**Next.js 15 Conventions:**

- Clear Server/Client Component separation
- Server Components (default): No React hooks, use for data fetching and static rendering
- Client Components: Add `"use client";` at top, use for interactivity and browser APIs
- Maximize Server-side Rendering for performance and SEO
- Component reusability to minimize code duplication (components, animations)
- Use `use context7` for framework/library documentation reference

**TypeScript Standards:**

- Strict type safety enabled in tsconfig.json
- Explicit types for functions, props, and API responses
- Handle null/undefined values and union types properly
- Follow ESLint rules including @typescript-eslint and react-hooks

**Development Files:**

- `BACKLOG.md` - Active tasks and feature backlog (read this for current priorities)
- `CHANGELOG.md` - Completed work history (for reference only)
- This file tracks overall architecture and conventions


## Token Efficiency Guidelines

**File Operations:**

- Use `Grep` instead of `Read` for pattern searches
- Use `Read` with offset/limit for large files when only specific sections needed
- Delegate complex file analysis to `Task` tool with specialized agents

**Search Optimization:**

- Combine `Glob` + `Grep` for multi-file searches
- Use specific patterns rather than broad searches
- Refine glob patterns to exclude irrelevant files

**Context Management:**

- Avoid re-requesting previously confirmed information
- Reuse established file structure knowledge
- Skip unnecessary explanations and summaries

**Batch Processing:**

- Execute multiple independent tool calls in single message
- Chain related bash commands with semicolons

**Response Compression:**

- Minimize comments in code blocks
- Remove redundant explanations
- Provide concise, focused answers
