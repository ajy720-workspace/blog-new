/**
 * 🎨 Site Configuration
 *
 * Personal information and branding settings for your blog.
 * Replace these values with your own information.
 */
import type { SiteConfig } from './types'

export const siteConfig: SiteConfig = {
  // 📝 Basic Site Information
  name: "ajy720's Blog",
  title: 'Blog - ajy720',
  description:
    'Personal blog about technology, programming, and web development.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://blog.ajy720.me',

  // 👤 Author Information
  author: {
    name: 'Hyeonseok An',
    email: 'ajy720@gmail.com',
    bio: 'Welcome to my personal blog where I share thoughts on technology, development, and life. Feel free to explore my posts and connect with me through the links below.',
    avatar: undefined, // e.g., '/images/my-avatar.jpg'
  },

  // 🔗 Social Media Links
  social: {
    github: 'https://github.com/ajy720',
    // twitter: 'https://twitter.com/yourusername',
    // linkedin: 'https://linkedin.com/in/yourusername',
    instagram: 'https://instagram.com/02.mm.dd',
    email: 'mailto:ajy720@gmail.com',
  },

  // 🏷️ SEO and Metadata
  metadata: {
    keywords: [
      'blog',
      'technology',
      'programming',
      'web development',
      'Next.js',
      'React',
    ],
    creator: 'Hyeonseok An',
    publisher: "ajy720's Blog",
  },
}
