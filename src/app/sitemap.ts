import { MetadataRoute } from 'next'
import { getPosts } from '@/lib/notion'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://blog.ajy720.me'

  const posts = await getPosts()

  const postSitemapEntries: MetadataRoute.Sitemap = posts.map(post => ({
    url: `${baseUrl}/${post.url_path}`,
    lastModified: new Date(post.created_time),
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ]

  return [...staticPages, ...postSitemapEntries]
}
