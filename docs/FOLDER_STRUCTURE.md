# Folder Structure & Naming Conventions

## 📁 Component Organization

### Directory Structure

```
src/components/
├── ads/                   # Advertisement components
├── analytics/             # Tracking & analytics components
├── animations/            # Animation utilities & components  
├── auth/                  # Authentication related components
├── comments/              # Comment system components
├── common/                # Shared utility components
├── layout/                # Layout & structural components
├── likes/                 # Like system components
├── post/                  # Post-related components & TOC
│   └── TOC/              # Table of Contents components
├── search/                # Search functionality components
├── seo/                   # SEO & metadata components
├── theme/                 # Theme & styling components
└── ui/                    # Base UI components (shadcn/ui)
```

### Component Categories

#### **Layout Components** (`layout/`)
Core structural elements of the application:
- `header.tsx` - Main navigation header
- `footer.tsx` - Site footer  
- `error-boundary.tsx` - Error boundary wrapper
- `personal-info.tsx` - Personal information section
- `Breadcrumbs.tsx` - Navigation breadcrumbs
- `CategorySidebar.tsx` - Category navigation sidebar
- `OptimizedPostGrid.tsx` - Optimized post grid layout
- `PostGrid.tsx` - Standard post grid layout

#### **Common Components** (`common/`)
Reusable utility components used across the application:
- `HeroImage.tsx` - Hero image display
- `LazyComponents.tsx` - Lazy loading wrappers
- `OptimizedImage.tsx` - Image optimization wrapper
- `PostCard.tsx` - Post card component
- `PostCardWithHero.tsx` - Post card with hero image
- `TagCloud.tsx` - Tag cloud visualization

#### **Theme Components** (`theme/`)
Theme and styling related components:
- `theme-provider.tsx` - Theme context provider
- `theme-toggle.tsx` - Theme switcher component

#### **Analytics Components** (`analytics/`)
Tracking and analytics functionality:
- `GoogleAnalytics.tsx` - Google Analytics integration
- `PageViewTracker.tsx` - Page view tracking
- `WebVitals.tsx` - Web vitals monitoring

#### **Advertisement Components** (`ads/`)
Ad-related components and configuration:
- `AdBanner.tsx` - Main ad banner component (now uses Tailwind CSS)
- `AdScript.tsx` - Ad script loader

#### **UI Components** (`ui/`)
Base UI components following shadcn/ui patterns:
- `button.tsx`, `card.tsx`, `dialog.tsx`, etc.
- All components use **kebab-case** naming

#### **Feature-Specific Folders**
Domain-specific components organized by feature:
- `comments/` - Comment system components
- `likes/` - Like functionality components
- `post/` - Post rendering and actions, includes TOC subfolder
- `search/` - Search interface components
- `seo/` - SEO and metadata components  
- `auth/` - Authentication components
- `animations/` - Animation utility components

## 📝 Naming Conventions

### File Naming Rules

#### **Component Files**
- **Business Logic Components**: `PascalCase.tsx`
  - Examples: `PostRenderer.tsx`, `CommentForm.tsx`, `LikeButton.tsx`
  
- **UI Components**: `kebab-case.tsx`
  - Examples: `button.tsx`, `dropdown-menu.tsx`, `loading-spinner.tsx`

#### **Folder Naming**
- **All folders**: `lowercase` or `kebab-case`
  - Examples: `components/`, `layout/`, `post/`, `seo/`

#### **CSS Files**
- Match component naming: `ComponentName.css`
  - Examples: `PostRenderer.css`

### Import Path Examples

#### **Individual Component Imports**
```typescript
// Layout components  
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

// Common utilities
import { HeroImage } from '@/components/common/HeroImage'
import { OptimizedImage } from '@/components/common/OptimizedImage'

// Theme components
import { ThemeProvider } from '@/components/theme/theme-provider'
import { ThemeToggle } from '@/components/theme/theme-toggle'

// Analytics
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics'
import { WebVitals } from '@/components/analytics/WebVitals'

// Feature-specific
import { PostRenderer } from '@/components/post/PostRenderer'
import { CommentForm } from '@/components/comments/CommentForm'
import { LikeButton } from '@/components/likes/LikeButton'

// UI components
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
```

#### **Folder Index Imports** (Recommended)
Each folder now includes an `index.ts` file for cleaner imports:

```typescript
// Layout components - multiple imports from same folder
import { Header, Footer, ErrorBoundary, PersonalInfoSection } from '@/components/layout'

// Common utilities - multiple imports from same folder  
import { HeroImage, LazyComments, PostCard, TagCloud } from '@/components/common'

// Theme components
import { ThemeProvider, ThemeToggle } from '@/components/theme'

// Analytics
import { GoogleAnalytics, PageViewTracker, WebVitals } from '@/components/analytics'

// Feature-specific
import { PostActions, PostRenderer } from '@/components/post'
import { CommentForm, CommentList, Comments } from '@/components/comments'
import { LikeButton, SyncedLikeButton } from '@/components/likes'
import { BreadcrumbNav, SocialShare, StructuredData } from '@/components/seo'

// UI components (existing pattern)
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
```

## 🎯 Organization Principles

### 1. **Feature-First Organization**
Components are primarily organized by their domain/feature rather than technical type.

### 2. **Separation of Concerns**
- **UI components** (`ui/`) - Pure presentation components
- **Layout components** (`layout/`) - Structural elements
- **Feature components** - Business logic and domain-specific functionality
- **Common components** (`common/`) - Shared utilities

### 3. **Consistent Import Paths**
All imports use absolute paths with the `@/components/` prefix for consistency.

### 4. **Scalability**
The structure allows for easy addition of new features and components without cluttering the root directory.

## 📦 Index Files & Barrel Exports

Each component folder includes an `index.ts` file that exports all components from that folder:

```typescript
// src/components/layout/index.ts
export { Header } from './header'
export { Footer } from './footer'
export { ErrorBoundary } from './error-boundary'
export { PersonalInfoSection, DEFAULT_PERSONAL_INFO } from './personal-info'
// ... other exports

// src/components/common/index.ts  
export { HeroImage } from './HeroImage'
export { LazyComments, LazyTagCloud } from './LazyComponents'
export { PostCard } from './PostCard'
// ... other exports
```

### Benefits of Index Files:
1. **Cleaner Imports**: Import multiple components from same folder in one line
2. **Better Organization**: Clear folder boundaries and exports
3. **Easier Refactoring**: Change internal file structure without breaking imports
4. **Consistent Patterns**: Standardized way to expose folder contents

## 🎨 Styling Approach

### CSS to Tailwind Migration
Recent changes have migrated from separate CSS files to Tailwind CSS:

```typescript
// Before: Separate CSS file
import './ad-styles.css'

// After: Tailwind classes directly in component
className="flex justify-center items-center mx-auto my-8"
```

### Benefits:
- **No separate CSS files** to maintain
- **Responsive design** built-in with Tailwind utilities
- **Better performance** through CSS purging
- **Consistent spacing** and design system

## 🔄 Migration Notes

Recent reorganization changes:
- Moved layout components from root to `layout/` folder
- Created `common/` folder for shared utilities  
- Established `theme/` folder for theme-related components
- Created `analytics/` folder for tracking components
- Standardized all folder names to lowercase
- **Added index.ts files** to each folder for barrel exports
- **Migrated CSS to Tailwind** for better maintainability
- Updated all import paths to reflect new structure

## 🚀 Best Practices

### 1. **Use Folder Index Imports**
```typescript
// ✅ Good - Clean and readable
import { Header, Footer } from '@/components/layout'

// ❌ Avoid - Verbose and cluttered  
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
```

### 2. **Follow Naming Conventions**
- **Folders**: `lowercase` or `kebab-case` 
- **Business Components**: `PascalCase.tsx`
- **UI Components**: `kebab-case.tsx`

### 3. **Organize by Feature**
Group related components together rather than by technical type.

### 4. **Use Tailwind for Styling**
Prefer Tailwind utility classes over separate CSS files for consistency and maintainability.

This structure provides better organization, easier navigation, cleaner imports, and clearer separation of concerns while maintaining scalability for future growth.