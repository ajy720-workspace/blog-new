# Blog Project

A modern blog built with Next.js 15, TypeScript, and Notion CMS.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **CMS**: Notion API
- **Database**: Supabase (optional)
- **Authentication**: JWT-based sessions
- **Fonts**: Pretendard (Korean), Roboto Mono

## Setup

1. **Install dependencies**:
   ```bash
   yarn install
   ```

2. **Environment variables**:
   Copy `.env.example` to `.env.local` and fill in your values:
   ```bash
   cp .env.example .env.local
   ```

3. **Required environment variables**:
   - `NOTION_API_KEY`: Your Notion integration API key
   - `NOTION_DATABASE_ID`: Your Notion database ID
   - `SESSION_SECRET`: Random secret for JWT signing
   - `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL (optional)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key (optional)

4. **Font files**:
   Download and place these font files in `src/app/fonts/`:
   - `PretendardVariable.woff2`
   - `RobotoMono-VariableFont_wght.ttf`

## Development

```bash
# Start development server
yarn dev

# Build for production
yarn build

# Start production server
yarn start

# Lint code
yarn lint

# Format code
yarn format
```

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   └── ...             # Feature components
├── lib/                # Utilities and business logic
│   ├── supabase/       # Supabase client configs
│   ├── notion.ts       # Notion API utilities
│   └── utils.ts        # Common utilities
└── types/              # TypeScript type definitions
```

## Notion Database Schema

Your Notion database should have these properties:
- **Title** (Title): Post title
- **URLPath** (Rich Text): URL slug for the post
- **Published** (Checkbox): Whether the post is published
- **Tags** (Multi-select): Post tags
- **Created** (Created time): Post creation date

## Development Guidelines

- Use Server Components by default, add `"use client"` only when needed
- Follow TypeScript strict mode - avoid `any` types
- Use shadcn/ui components for UI elements
- Maintain consistent code style with Prettier and ESLint
- Commit changes with descriptive messages in English