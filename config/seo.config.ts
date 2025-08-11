export interface SEOConfig {
  defaultTitle: string
  titleTemplate: string
  defaultDescription: string
  defaultKeywords: string[]
  openGraph: {
    siteName: string
    locale: string
    type: string
  }
  schema: {
    organization: {
      name: string
      logo?: string
      sameAs: string[]
    }
    website: {
      name: string
      alternateName?: string
    }
  }
  robots: {
    index: boolean
    follow: boolean
    googleBot?: {
      index: boolean
      follow: boolean
      'max-video-preview': number
      'max-image-preview': string
      'max-snippet': number
    }
  }
}

export const seoConfig: SEOConfig = {
  defaultTitle: 'Blog - ajy720',
  titleTemplate: '%s | ajy720',
  defaultDescription:
    'Personal blog about technology, programming, and web development.',
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

  openGraph: {
    siteName: 'Blog - ajy720',
    locale: 'en_US',
    type: 'website',
  },

  schema: {
    organization: {
      name: "ajy720's Blog",
      sameAs: [
        'https://github.com/ajy720',
        'https://www.instagram.com/02.mm.dd',
      ],
    },
    website: {
      name: "ajy720's Blog",
      alternateName: 'Blog - ajy720',
    },
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}
