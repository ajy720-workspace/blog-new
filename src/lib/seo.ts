import { NotionPost } from './notion'

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function extractExcerpt(content: string, length: number = 160): string {
  const plainText = content
    .replace(/<[^>]*>/g, '')
    .replace(/\n+/g, ' ')
    .trim()

  if (plainText.length <= length) {
    return plainText
  }

  return plainText.substring(0, length - 3).trim() + '...'
}

export function generateMetaDescription(content: string): string {
  return extractExcerpt(content, 160)
}

export function optimizeTitle(title: string, maxLength: number = 60): string {
  if (title.length <= maxLength) {
    return title
  }

  return title.substring(0, maxLength - 3).trim() + '...'
}

export interface BreadcrumbItem {
  name: string
  url: string
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function generatePostSchema(post: NotionPost, content?: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://blog.ajy720.me'

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: content
      ? generateMetaDescription(content)
      : `Posted on ${new Date(post.created_time).toLocaleDateString()}`,
    author: {
      '@type': 'Person',
      name: 'Hyeonseok An',
      url: baseUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Blog',
      url: baseUrl,
    },
    datePublished: post.created_time,
    dateModified: post.created_time,
    url: `${baseUrl}/${post.url_path}`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/${post.url_path}`,
    },
    keywords: post.tags.join(', '),
  }
}

export function generateOrganizationSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://blog.ajy720.me'

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Blog',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    sameAs: [
      // Add your social media URLs here
    ],
  }
}

export function generateWebSiteSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://blog.ajy720.me'

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Blog',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export interface OpenGraphData {
  title: string
  description: string
  url: string
  type?: 'website' | 'article'
  image?: string
  siteName?: string
}

export function generateOpenGraphTags(data: OpenGraphData) {
  return {
    'og:title': data.title,
    'og:description': data.description,
    'og:url': data.url,
    'og:type': data.type || 'website',
    'og:site_name': data.siteName || 'Blog - ajy720',
    ...(data.image && { 'og:image': data.image }),
  }
}

export function generateTwitterCardTags(data: OpenGraphData) {
  return {
    'twitter:card': 'summary_large_image',
    'twitter:title': data.title,
    'twitter:description': data.description,
    ...(data.image && { 'twitter:image': data.image }),
  }
}

export function getCanonicalUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://blog.ajy720.me'
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`
}
