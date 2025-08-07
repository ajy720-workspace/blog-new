# PRD v2.0 - Comment System

## Overview
Implement a comprehensive comment system using Supabase as the backend database, enabling user engagement with blog posts while maintaining data integrity and user experience.

## Core Requirements

### Database Architecture (Supabase)

#### Comment Table Schema
```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  notion_page_id VARCHAR NOT NULL,  -- FK reference to Notion post (semantic only)
  author_name VARCHAR(100) NOT NULL,
  author_email VARCHAR(255),        -- Optional for future features
  content TEXT NOT NULL,
  user_id UUID,                     -- NULL for anonymous users, FK for authenticated
  is_anonymous BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT false,
  ip_address INET,                  -- For moderation purposes
  user_agent TEXT                   -- For security tracking
);

CREATE INDEX idx_comments_notion_page_id ON comments(notion_page_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);
```

### Authentication Strategy
**Phase 1: Anonymous Users (v2.0) - Supabase Auth Anonymous**
- Use Supabase Auth Anonymous functionality
  - Reference: https://supabase.com/docs/guides/auth/auth-anonymous
  - Sign in anonymously: https://supabase.com/docs/reference/javascript/auth-signinanonymously
- No user registration required for commenting
- Anonymous sessions managed by Supabase
- Automatic session handling and persistence

**Phase 2 Preparation: OAuth Integration (Future)**
- Database schema supports user_id for future OAuth integration
- Comment ownership transfer capability
- User profile association

### Comment Functionality

#### Comment CRUD Operations
- **Create**: Anonymous users can submit comments with name/content
- **Read**: Display all approved comments chronologically
- **Update**: Comments are immutable (no editing after submission)
- **Delete**: Comments can be soft-deleted (marked as deleted, not removed)

#### Comment Form Component
```typescript
interface CommentFormProps {
  notionPageId: string;
  onCommentSubmitted: (comment: Comment) => void;
}

interface CommentFormData {
  authorName: string;      // Required, 1-100 characters
  content: string;         // Required, 1-2000 characters
  authorEmail?: string;    // Optional, for future notifications
}
```

**Form Validation:**
- Author name: Required, 1-100 characters, no special characters
- Content: Required, 1-2000 characters
- Email: Optional, valid email format if provided
- Rate limiting: Max 3 comments per IP per hour

#### Comment Display Component
```typescript
interface CommentListProps {
  notionPageId: string;
  comments: Comment[];
}

interface CommentItemProps {
  comment: {
    id: string;
    authorName: string;
    content: string;
    createdAt: string;
    isDeleted: boolean;
  };
}
```

**Display Features:**
- Chronological ordering (newest first)
- Author name and timestamp display
- Soft-deleted comments show as "[Comment deleted]"
- Responsive design for mobile/desktop
- Loading states and error handling

### Input Validation
- **Content Sanitization**: Basic XSS prevention
- **Form Validation**: Client and server-side validation
- **Character Limits**: Enforce content length restrictions

### Database Integration

#### Supabase Auth Integration
```typescript
// Client-side anonymous auth
import { createClient } from '@/lib/supabase/client'

// Initialize anonymous session
export async function initAnonymousSession(): Promise<void> {
  const { data, error } = await supabase.auth.signInAnonymously()
}

// Comment submission with anonymous user
export async function submitComment(formData: CommentFormData, notionPageId: string)

// Comment retrieval
export async function getComments(notionPageId: string): Promise<Comment[]>
```

#### Server Actions Implementation
- Form submission via Next.js Server Actions
- Validation and sanitization on server side
- Error handling with user-friendly messages
- Success feedback and automatic comment refresh

## Technical Implementation

### Component Architecture
```
components/Comments/
├── CommentForm.tsx        # Comment submission form
├── CommentList.tsx        # Comments display container
├── CommentItem.tsx        # Individual comment component
├── CommentCount.tsx       # Comment counter for posts
└── CommentModeration.tsx  # Admin tools (future scope)
```

### Server Actions
```
app/actions/
└── comments.ts           # All comment-related server actions
```

### Database Utilities
```
lib/supabase/
├── comments.ts           # Comment-specific database operations
└── validation.ts         # Input validation utilities
```

## User Experience Flow

### Comment Submission Flow
1. User views blog post
2. Scrolls to comment section
3. Fills out comment form (name + content)
4. Submits comment via Server Action
5. Form resets and new comment appears in list
6. Success message confirms submission

### Comment Viewing Experience
- Comments load automatically with page
- Smooth scrolling to comment section
- Real-time comment count updates
- Mobile-optimized layout
- Accessibility compliance (WCAG 2.1 AA)

## Success Criteria
- [ ] Anonymous users can successfully submit comments
- [ ] Comments display correctly with proper formatting
- [ ] Form validation prevents invalid submissions
- [ ] Supabase anonymous auth sessions work correctly
- [ ] Comments persist correctly in Supabase
- [ ] Mobile responsive comment interface
- [ ] Loading states provide clear user feedback
- [ ] Basic input validation prevents malicious content
- [ ] Comment count displays accurately on posts

## Performance Requirements
- Comment form submission: < 500ms response time
- Comment list loading: < 1s for 50 comments
- Database queries optimized with proper indexing
- Pagination for posts with >50 comments (future enhancement)

## Dependencies
- Successful completion of PRD v1.0 and v1.5
- Supabase project setup and configuration
- Database migration execution
- Environment variables configuration

## Moved to Backlog (Out of Scope for v2.0)
- Advanced security and moderation features
- Rate limiting and spam protection
- IP tracking and admin moderation dashboard
- Content filtering and profanity detection

## Future Enhancements (Out of Scope for v2.0)
- OAuth authentication integration
- Comment threading/replies
- Real-time comment updates
- Email notifications for new comments
- Comment reactions/voting system