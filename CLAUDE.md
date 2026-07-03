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
- PostgreSQL for comments, likes, profiles, and app users
- Database access through `src/lib/db/client.ts` using `pg`
- Session-based auth using JWT (jose library)
- bcryptjs for password hashing
- Server Actions instead of API routes for backend operations
- Business logic in Server Actions for maintainable frontend

**Key Directory Structure:**

- `src/app/` - Next.js app router pages and server actions (Server Components by default)
- `src/components/` - React components organized by feature (use `.client.tsx` for Client Components)
- `src/lib/` - Core utilities and business logic
- `src/types/` - TypeScript type definitions
- `db/migrations/` - PostgreSQL schema migrations

### Component Structure
```
src/components/
├── ads/          # Ad components (Tailwind CSS)
├── analytics/    # Tracking (GA, WebVitals)
├── common/       # Shared utilities (HeroImage, PostCard)
├── layout/       # Structure (Header, Footer, Breadcrumbs)
├── theme/        # Theme provider & toggle
├── post/         # Post rendering & TOC
├── comments/     # Comment system
├── likes/        # Like functionality
├── seo/          # SEO components
├── search/       # Search interface
└── ui/           # shadcn/ui components
```

**Naming Rules**
- **Folders**: `lowercase` / `kebab-case`
- **Business Components**: `PascalCase.tsx` (PostRenderer, CommentForm)
- **UI Components**: `kebab-case.tsx` (button, dropdown-menu)

**Import Pattern (Recommended)**
```typescript
// Use folder index imports
import { Header, Footer } from '@/components/layout'
import { HeroImage, PostCard } from '@/components/common'
import { ThemeProvider, ThemeToggle } from '@/components/theme'

// Each folder has index.ts for barrel exports
```

**Styling**
- **Tailwind CSS**: Utility classes instead of separate CSS files
- **Responsive**: Built-in with Tailwind (`max-md:`, `xl:`)

### Database Integration

**PostgreSQL Setup:**

- Server-side database pool: `src/lib/db/client.ts`
- Auth/session helpers: `src/lib/auth/session.ts`
- Uses environment variables: `DATABASE_URL`, `SESSION_SECRET`

### UI System

**Design System:**

- Uses shadcn/ui components with Radix UI primitives
- Tailwind CSS for styling with custom component variants
- `src/components/ui/` contains reusable UI components
- `components.json` configures component generation


### Environment Variables Required

- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - JWT signing secret for app sessions
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` - GitHub OAuth credentials
- `NEXT_PUBLIC_NOTION_API_KEY` - Notion API key

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
