# PRD v1.0 - Blog Basic Functionality

## Overview
Develop a modern personal blog platform with fundamental content management and viewing capabilities using Next.js 15 and Notion as CMS.

## Core Requirements

### Project Foundation
- **Theme Support**: Light/Dark mode toggle with system preference detection
- **Typography**: Preloaded fonts
  - Sans-serif: Pretendard
  - Monospace: Roboto Mono

### Content Management System
- **Notion Integration**: Use Notion API as headless CMS
  - **Library**: [@notionhq/client](https://github.com/makenotion/notion-sdk-js)
  - **Operations**: Read-only access from Next.js app
  - **Content Management**: Full CRUD operations via Notion interface

### Main Feed View
- **Personal Information Section**
  - Profile information display
  - Social media links integration
  - Emphasis on visual design and branding

- **Post List Component**
  - Display posts with title and creation date
  - Click-through navigation to individual posts
  - Chronological ordering (newest first)

### Post Detail View
- **Metadata Display**
  - Post title
  - Creation date
  - Tag system for categorization

- **Content Rendering**
  - **Library**: [react-notion-x](https://github.com/NotionX/react-notion-x)
  - Full Notion block support including rich text, images, embeds
  - Responsive design for all content types

- **URL Structure**
  - Custom URL paths using `url_path` property from Notion
  - SEO-friendly slugs instead of random strings

## Technical Stack
- **Frontend**: Next.js 15 (App Router), React 19.1, TypeScript
- **Styling**: Tailwind CSS 4, shadcn/ui components
- **CMS**: Notion API
- **Package Manager**: Yarn

## Success Criteria
- [ ] Users can view all published blog posts in chronological order
- [ ] Individual posts render correctly with full Notion content support
- [ ] Theme switching works seamlessly
- [ ] Custom URL paths are functional and SEO-friendly
- [ ] Social links and personal info are properly displayed
- [ ] Responsive design works on desktop and mobile

## Out of Scope for v1.0
- Comments functionality
- SEO optimization
- Advanced UX features
- User authentication
- Content search