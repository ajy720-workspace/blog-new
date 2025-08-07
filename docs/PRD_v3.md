# PRD v3.0 - UX Improvements & Enhanced Features

## Overview
Enhance user experience with visual improvements, advanced navigation features, and OAuth integration to create a more engaging and professional blog platform.

## Core UX Enhancements

### 1. Hero Image Integration
**Notion Page Cover → Blog Hero Images**

#### Implementation Requirements
- Extract cover images from Notion page properties
- Implement responsive hero image component
- Fallback system for posts without cover images
- Optimize images for different screen sizes and devices

```typescript
interface HeroImageProps {
  coverImage?: string;
  title: string;
  createdAt: string;
}
```

### 2. Enhanced Post Preview Cards
**Dynamic card layouts based on content availability**

#### Card Variant A: With Hero Image
```typescript
interface PostCardWithHero {
  heroImage: string;
  title: string;
  createdAt: string;
  excerpt?: string;
  tags: string[];
  category: string;
}
```
- Hero image as background or prominent display
- Overlay text for better readability
- Consistent aspect ratios across cards

#### Card Variant B: Text-Only
```typescript
interface PostCardTextOnly {
  title: string;
  createdAt: string;
  excerpt: string;      // Auto-generated from content
  tags: string[];
  category: string;
}
```
- Prominent title display
- Content preview (first 150-200 characters)
- Visual emphasis through typography

### 3. Advanced Navigation System

#### Tag-Based Navigation
- **Tag List Page**: Display all available tags with post counts
- **Tag Detail Pages**: Show posts filtered by specific tag
- **Tag Cloud Component**: Visual representation of popular tags
- **URL Structure**: `/tag/[tag-slug]`

#### Category System
- **Category Pages**: Dedicated pages for each category
- **Main Category Showcase**: Homepage sections for major categories (5-10 posts each)
- **Category Navigation**: Sidebar or header navigation for categories
- **URL Structure**: `/category/[category-slug]`

```typescript
interface CategoryShowcase {
  categoryName: string;
  posts: PostPreview[];      // Limited to 5-10 posts
  viewAllUrl: string;
}
```

### 4. OAuth Authentication Integration
**GitHub OAuth as primary authentication method**

#### Authentication Flow (Supabase Auth)
1. **Anonymous Comment Submission**: Users comment using Supabase anonymous sessions
2. **Post-Comment OAuth Prompt**: Modal appears after comment submission
3. **Account Linking**: Link anonymous session to OAuth account via Supabase Auth

#### Technical Implementation (Supabase)
```typescript
// Supabase OAuth configuration
const supabaseAuth = {
  providers: ['github'],
  redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
}

// Convert anonymous user to OAuth user
export async function linkAnonymousToOAuth() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github'
  })
}
```

#### Supabase Auth Integration
- Leverage Supabase's built-in auth.users table
- OAuth providers managed through Supabase dashboard
- User sessions and state handled automatically
- No custom user table required

```typescript
// Supabase handles user management automatically
// Comments table references auth.users via user_id
interface Comment {
  id: string;
  notion_page_id: string;
  content: string;
  user_id: string;  // References Supabase auth.users
  created_at: string;
}
```

### 5. Component Architecture Improvements

#### Reusable Animation Components
```
components/animations/
├── FadeIn.tsx            # Fade-in animation wrapper
├── SlideUp.tsx           # Slide-up animation for cards
├── StaggeredList.tsx     # Staggered animations for lists
└── PageTransition.tsx    # Page transition animations
```

#### Enhanced Layout Components
```
components/layout/
├── CategorySidebar.tsx   # Category navigation sidebar
├── TagCloud.tsx          # Interactive tag cloud
├── PostGrid.tsx          # Responsive post grid layout
├── SearchBar.tsx         # Site-wide search functionality
└── Breadcrumbs.tsx       # Enhanced breadcrumb navigation
```


## OAuth Integration Details

### Supabase OAuth Implementation
```typescript
// GitHub OAuth via Supabase
export async function signInWithGitHub() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
    }
  })
}

// Auth callback handling
export async function handleAuthCallback() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}
```

### Comment Ownership Transfer (Supabase)
**Challenge**: Link anonymous comments to authenticated users
**Solution**: 
- Use Supabase's anonymous-to-authenticated user conversion
- Anonymous session automatically converts to authenticated session
- Comments linked via user_id remain consistent during conversion
- Supabase handles session continuity automatically

### User Experience Flow
1. User submits anonymous comment
2. Success message with OAuth prompt modal
3. User chooses to authenticate via GitHub
4. OAuth flow completes, user account created
5. Previous comment automatically linked to new account
6. Future comments automatically attributed to authenticated user


## Success Criteria
- [ ] Hero images display correctly across all device sizes
- [ ] Post preview cards adapt based on available content
- [ ] Tag and category navigation is intuitive and functional
- [ ] GitHub OAuth integration works seamlessly via Supabase
- [ ] Anonymous comment linking to OAuth accounts functions properly
- [ ] Page load times remain under 3 seconds
- [ ] All animations enhance UX without causing performance issues

## Performance Considerations
- **Image Optimization**: Next.js Image component for all hero images
- **Code Splitting**: Lazy load OAuth components
- **Animation Performance**: Use CSS transforms and opacity for smooth animations
- **Bundle Size**: Monitor and optimize JavaScript bundle size
- **Caching Strategy**: Implement proper caching for API responses

## Dependencies
- Successful completion of PRD v2.0 (Comment System)
- GitHub OAuth App setup and credentials
- Enhanced Supabase schema with users table
- Updated session management system

## Moved to Backlog (Out of Scope for v3.0)
- Advanced search functionality and content discovery
- Mobile-specific optimizations and gestures
- Social features and author profiles
- Advanced analytics and dashboards

## Future Considerations (Out of Scope for v3.0)
- Multiple OAuth providers (Google, Twitter)
- Advanced comment moderation dashboard
- Real-time notifications
- Content management dashboard
- Multi-author support
- Newsletter integration