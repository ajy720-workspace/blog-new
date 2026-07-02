import { seoConfig, siteConfig } from '@/config'
import type { NotionPost } from '@/types/notion'

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
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: content
      ? generateMetaDescription(content)
      : `Posted on ${new Date(post.created_time).toLocaleDateString()}`,
    author: {
      '@type': 'Person',
      name: siteConfig.author.name,
      url: siteConfig.url,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
    },
    datePublished: post.created_time,
    dateModified: post.created_time,
    url: `${siteConfig.url}/${post.url_path}`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteConfig.url}/${post.url_path}`,
    },
    keywords: post.tags.join(', '),
  }
}

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: seoConfig.schema.organization.name,
    url: siteConfig.url,
    ...(seoConfig.schema.organization.logo && {
      logo: `${siteConfig.url}${seoConfig.schema.organization.logo}`,
    }),
    sameAs: seoConfig.schema.organization.sameAs,
  }
}

export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: seoConfig.schema.website.name,
    ...(seoConfig.schema.website.alternateName && {
      alternateName: seoConfig.schema.website.alternateName,
    }),
    url: siteConfig.url,
    description: siteConfig.description,
    author: {
      '@type': 'Person',
      name: siteConfig.author.name,
      url: siteConfig.url,
    },
  }
}

export interface OpenGraphData {
  title: string
  description: string
  url: string
  tags: string[]
  createTime: string
  type?: 'website' | 'article'
  image?: string
  siteName?: string
}

export function generateOpenGraphTags(data: OpenGraphData) {
  return {
    title: data.title,
    description: data.description,
    url: data.url,
    type: data.type || 'website',
    site_name: data.siteName || seoConfig.openGraph.siteName,
    images: [{ url: data.image || seoConfig.openGraph.defaultCover }],
    authors: [siteConfig.author.name],
    tags: data.tags,
    publishedTime: data.createTime,
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
  return `${siteConfig.url}${path.startsWith('/') ? path : `/${path}`}`
}
