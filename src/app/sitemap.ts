import { MetadataRoute } from 'next'
import { getPosts, getAllTags, getAllCategories } from '@/lib/core/notion'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://blog.ajy720.me'

  const [posts, tags, categories] = await Promise.all([
    getPosts(),
    getAllTags(),
    getAllCategories(),
  ])

  const postSitemapEntries: MetadataRoute.Sitemap = posts.map(post => ({
    url: `${baseUrl}/${post.url_path}`,
    lastModified: new Date(post.created_time),
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  const tagSitemapEntries: MetadataRoute.Sitemap = tags.map(tag => ({
    url: `${baseUrl}/tag/${tag.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  const categorySitemapEntries: MetadataRoute.Sitemap = categories.map(
    category => ({
      url: `${baseUrl}/category/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    })
  )

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/tags`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]

  return [
    ...staticPages,
    ...postSitemapEntries,
    ...tagSitemapEntries,
    ...categorySitemapEntries,
  ]
}
