export interface SiteConfig {
  name: string
  title: string
  description: string
  url: string
  author: {
    name: string
    email: string
    bio: string
    avatar?: string
  }
  social: {
    github?: string
    twitter?: string
    linkedin?: string
    instagram?: string
    email: string
  }
  metadata: {
    keywords: string[]
    creator: string
    publisher: string
  }
}

export const siteConfig: SiteConfig = {
  name: "ajy720's Blog",
  title: 'Blog - ajy720',
  description:
    'Personal blog about technology, programming, and web development.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://blog.ajy720.me',

  author: {
    name: 'Hyeonseok An',
    email: 'ajy720@gmail.com',
    bio: 'Welcome to my personal blog where I share thoughts on technology, development, and life. Feel free to explore my posts and connect with me through the links below.',
    avatar: undefined, // Set this to your avatar image path
  },

  social: {
    github: 'https://github.com/ajy720',
    instagram: 'https://instagram.com/02.mm.dd',
    email: 'mailto:ajy720@gmail.com',
  },

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
