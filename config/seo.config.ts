/**
 * 🔍 SEO Configuration
 *
 * Search engine optimization and social media sharing settings.
 * Optimize these values for better search visibility.
 */
import type { SEOConfig } from './types'

export const seoConfig: SEOConfig = {
  // 🏷️ Page Titles
  defaultTitle: 'Blog - ajy720',
  titleTemplate: '%s | ajy720', // %s = page title

  // 📝 Meta Description
  defaultDescription:
    'Personal blog about technology, programming, and web development.',

  // 🏷️ Default Keywords
  defaultKeywords: [
    'blog',
    'technology',
    'programming',
    'web development',
    'Next.js',
    'React',
    'TypeScript',
    'JavaScript',
  ],

  // 📱 Social Media (Open Graph)
  openGraph: {
    siteName: 'Blog - ajy720',
    locale: 'en_US', // Change to 'ko_KR' for Korean
    type: 'website',
  },

  // 🔍 Structured Data (Schema.org)
  schema: {
    organization: {
      name: "ajy720's Blog",
      // logo: '/logo.png', // Optional logo
      sameAs: [
        'https://github.com/ajy720',
        'https://www.instagram.com/02.mm.dd',
        // Add more social profiles here
      ],
    },
    website: {
      name: "ajy720's Blog",
      alternateName: 'Blog - ajy720',
    },
  },

  // 🤖 Search Engine Settings
  robots: {
    index: true, // Allow indexing
    follow: true, // Allow following links
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1, // -1 = no limit
      'max-image-preview': 'large',
      'max-snippet': -1, // -1 = no limit
    },
  },
}
