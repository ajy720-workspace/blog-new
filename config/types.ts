/**
 * 🎯 Configuration Types
 *
 * This file contains all TypeScript interfaces for blog configuration files.
 * These types ensure type safety and provide documentation for configuration options.
 */

/**
 * 🎨 Site Configuration Interface
 *
 * Controls personal information, branding, and basic site settings.
 */
export interface SiteConfig {
  /** The name of your blog (used in schema.org and branding) */
  name: string
  /** The main title shown in browser tabs and meta tags */
  title: string
  /** Brief description of your blog (used in meta descriptions and SEO) */
  description: string
  /** Your blog's primary URL (should match your domain) */
  url: string
  /** Author information displayed throughout the site */
  author: {
    /** Your full name (displayed on homepage and about sections) */
    name: string
    /** Your email address (used for contact and schema.org) */
    email: string
    /** A short bio about yourself (displayed on homepage) */
    bio: string
    /** Path to your avatar image (optional, e.g., '/images/avatar.jpg') */
    avatar?: string
  }
  /** Social media links (only include the platforms you want to display) */
  social: {
    /** Your GitHub profile URL (optional) */
    github?: string
    /** Your Twitter/X profile URL (optional) */
    twitter?: string
    /** Your LinkedIn profile URL (optional) */
    linkedin?: string
    /** Your Instagram profile URL (optional) */
    instagram?: string
    /** Your contact email with mailto: prefix (required) */
    email: string
  }
  /** Metadata used for SEO and site information */
  metadata: {
    /** Keywords related to your blog content (used in meta tags) */
    keywords: string[]
    /** Creator name (used in meta tags) */
    creator: string
    /** Publisher name (used in meta tags and schema.org) */
    publisher: string
  }
}

/**
 * 🔍 SEO Configuration Interface
 *
 * Controls search engine optimization settings including meta tags,
 * Open Graph data, structured data, and search engine directives.
 */
export interface SEOConfig {
  /** Default page title (used for homepage and fallback) */
  defaultTitle: string
  /** Template for page titles, %s will be replaced with page-specific title */
  titleTemplate: string
  /** Default meta description (used for homepage and fallback) */
  defaultDescription: string
  /** Default keywords for meta tags (can be overridden per page) */
  defaultKeywords: string[]
  /** Open Graph settings for social media sharing */
  openGraph: {
    /** Site name displayed in social media cards */
    siteName: string
    /** Primary language/locale (e.g., 'en_US', 'ko_KR') */
    locale: string
    /** Default Open Graph type ('website' for main site, 'article' for posts) */
    type: string
  }
  /** Structured data (schema.org) for search engines */
  schema: {
    /** Organization information for rich snippets */
    organization: {
      /** Organization/blog name */
      name: string
      /** URL to your logo image (optional, e.g., '/logo.png') */
      logo?: string
      /** Social media and other profile URLs for verification */
      sameAs: string[]
    }
    /** Website information for search engines */
    website: {
      /** Primary website name */
      name: string
      /** Alternative name for the website (optional) */
      alternateName?: string
    }
  }
  /** Search engine crawler directives */
  robots: {
    /** Allow search engines to index your pages (true = allow indexing) */
    index: boolean
    /** Allow search engines to follow links on your pages (true = allow following) */
    follow: boolean
    /** Google-specific bot directives (optional) */
    googleBot?: {
      /** Allow Google to index your pages */
      index: boolean
      /** Allow Google to follow links on your pages */
      follow: boolean
      /** Max video preview length in seconds (-1 = no limit) */
      'max-video-preview': number
      /** Max image preview size ('none' | 'standard' | 'large') */
      'max-image-preview': 'none' | 'standard' | 'large'
      /** Max text snippet length (-1 = no limit) */
      'max-snippet': number
    }
  }
}

/**
 * 🔒 Security Configuration Interface
 *
 * Controls security policies including rate limiting, CORS settings,
 * allowed hosts, and session management.
 */
export interface SecurityConfig {
  /** Rate limiting to prevent abuse */
  rateLimit: {
    /** Comment submission rate limits */
    comments: {
      /** Maximum comments allowed per time window */
      maxPerHour: number
      /** Time window in milliseconds (1 hour = 60 * 60 * 1000) */
      windowMs: number
    }
  }
  /** Hosts allowed for origin validation (supports wildcards like '*.domain.com') */
  allowedHosts: string[]
  /** Cross-Origin Resource Sharing (CORS) settings */
  cors: {
    /** Allowed origins for CORS requests */
    origins: string[]
    /** Allow credentials (cookies, authorization headers) in CORS requests */
    credentials: boolean
  }
  /** User session configuration */
  session: {
    /** Name of the session cookie */
    cookieName: string
    /** Session duration in seconds (7 days = 7 * 24 * 60 * 60) */
    maxAge: number
    /** Only send cookies over HTTPS (auto-enabled in production) */
    secure: boolean
    /** Prevent JavaScript access to session cookies (security) */
    httpOnly: boolean
    /** Cookie SameSite policy ('lax' = good default, 'strict' = more secure, 'none' = for cross-site) */
    sameSite: 'lax' | 'strict' | 'none'
  }
}
