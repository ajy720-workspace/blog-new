import { Client } from '@notionhq/client'
import { NotionAPI } from 'notion-client'
import { NotionCompatAPI } from 'notion-compat'

import { slugify } from '../utils/slug-utils'

export const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

export interface NotionPost {
  id: string
  title: string
  url_path: string
  created_time: string
  tags: string[]
  published: boolean
  coverImage?: string
  category?: string
}

// Utility function to parse Notion page data into NotionPost format
function parseNotionPage(pageData: Record<string, unknown>): NotionPost {
  const properties = (pageData.properties as Record<string, unknown>) || {}
  const titleProp = properties.Title as { title?: { plain_text?: string }[] }
  const urlPathProp = properties.URLPath as {
    rich_text?: { plain_text?: string }[]
  }

  const createdProp = properties.PublishedAt as { date?: { start: string } }
  const tagsProp = properties.Tags as { multi_select?: { name: string }[] }
  const publishedProp = properties.Published as { checkbox?: boolean }

  // Extract cover image from page cover or properties
  const cover = pageData.cover as {
    type?: string
    external?: { url: string }
    file?: { url: string }
  } | null
  const coverImage = cover?.external?.url || cover?.file?.url || undefined

  // Extract category from properties (assuming a Category select property)
  const categoryProp = properties.Category as { select?: { name: string } }
  const category = categoryProp?.select?.name || undefined

  return {
    id: pageData.id as string,
    title: titleProp?.title?.[0]?.plain_text || 'Untitled',
    url_path:
      urlPathProp?.rich_text?.[0]?.plain_text || (pageData.id as string),
    created_time: createdProp?.date?.start || (pageData.created_time as string),
    tags: tagsProp?.multi_select?.map(tag => tag.name) || [],
    published: publishedProp?.checkbox || false,
    coverImage,
    category,
  }
}

// Cache for posts data to avoid multiple API calls
let postsCache: NotionPost[] | null = null
let cacheTimestamp = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds

function isCacheValid(): boolean {
  return false
  return postsCache !== null && Date.now() - cacheTimestamp < CACHE_DURATION
}

export async function getPosts(forceRefresh = false): Promise<NotionPost[]> {
  // Return cached data if valid and not forcing refresh
  if (!forceRefresh && isCacheValid()) {
    return postsCache!
  }

  if (!process.env.NOTION_DATABASE_ID) {
    throw new Error('NOTION_DATABASE_ID is not defined')
  }

  // 클실: Notion API 호출에 캐시 태그 추가는 어렵지만, 결과를 캐시하는 방식으로 처리
  const response = await notion.databases.query({
    database_id: process.env.NOTION_DATABASE_ID,
    filter: {
      // property: 'Published',
      // checkbox: {
      //   equals: true,
      // },
      property: 'Status',
      status: {
        equals: 'Completed',
      },
    },
    sorts: [
      {
        property: 'PublishedAt',
        direction: 'descending',
      },
    ],
  })

  const posts = response.results.map((page: unknown) => {
    const pageData = page as Record<string, unknown>
    return parseNotionPage(pageData)
  })

  // Cache the results
  postsCache = posts
  cacheTimestamp = Date.now()

  return posts
}

export async function getPostBySlug(slug: string): Promise<NotionPost | null> {
  if (!process.env.NOTION_DATABASE_ID) {
    throw new Error('NOTION_DATABASE_ID is not defined')
  }

  const response = await notion.databases.query({
    database_id: process.env.NOTION_DATABASE_ID,
    filter: {
      and: [
        {
          property: 'URLPath',
          rich_text: {
            equals: slug,
          },
        },
        {
          property: 'Published',
          checkbox: {
            equals: true,
          },
        },
      ],
    },
  })

  if (response.results.length === 0) {
    return null
  }

  const pageData = response.results[0] as Record<string, unknown>
  return parseNotionPage(pageData)
}

export async function getPageContent(pageId: string) {
  // console.log(`Fetching page content for ID: ${pageId}`)

  // 1단계: notion-client의 비공식 API 시도 (빠르고 완전한 데이터)
  const api = new NotionAPI({
    activeUser: process.env.NOTION_ACTIVE_USER,
    authToken: process.env.NOTION_AUTH_TOKEN,
  })

  try {
    const response = await api.getPage(pageId)
    // console.log(
    //   `Successfully fetched page content with notion-client: ${pageId}`
    // )
    return response
  } catch (error) {
    // console.log(
    //   `notion-client failed for ${pageId}, attempting fallback with notion-compat`
    // )
    console.error('notion-client error:', error)

    // 2단계: notion-compat + 공식 API로 fallback (대용량 페이지 대응)
    try {
      const compatAPI = new NotionCompatAPI(notion)

      // notion-compat로 recordMap 변환
      const recordMap = await compatAPI.getPage(pageId)

      // console.log(
      //   `Successfully fetched page content with notion-compat: ${pageId}`
      // )
      return recordMap
    } catch (compatError) {
      console.error(`notion-compat also failed for ${pageId}:`, compatError)

      // 3단계: 최후의 fallback - 빈 recordMap 반환
      return {
        block: {
          [pageId]: {
            value: {
              id: pageId,
              type: 'page',
              properties: {},
            },
          },
        },
        notion: {
          results: [],
        },
      }
    }
  }
}

interface RichText {
  plain_text?: string
}

interface BlockContent {
  rich_text?: RichText[]
}

interface NotionBlock {
  type: string
  paragraph?: BlockContent
  heading_1?: BlockContent
  heading_2?: BlockContent
  heading_3?: BlockContent
  bulleted_list_item?: BlockContent
  numbered_list_item?: BlockContent
  quote?: BlockContent
  code?: BlockContent
}

function extractTextFromBlock(block: NotionBlock): string {
  if (!block) return ''

  let text = ''

  // Extract text based on block type
  if (block.type === 'paragraph' && block.paragraph?.rich_text) {
    text += block.paragraph.rich_text.map(rt => rt.plain_text || '').join('')
  } else if (block.type === 'heading_1' && block.heading_1?.rich_text) {
    text += block.heading_1.rich_text.map(rt => rt.plain_text || '').join('')
  } else if (block.type === 'heading_2' && block.heading_2?.rich_text) {
    text += block.heading_2.rich_text.map(rt => rt.plain_text || '').join('')
  } else if (block.type === 'heading_3' && block.heading_3?.rich_text) {
    text += block.heading_3.rich_text.map(rt => rt.plain_text || '').join('')
  } else if (
    block.type === 'bulleted_list_item' &&
    block.bulleted_list_item?.rich_text
  ) {
    text += block.bulleted_list_item.rich_text
      .map(rt => rt.plain_text || '')
      .join('')
  } else if (
    block.type === 'numbered_list_item' &&
    block.numbered_list_item?.rich_text
  ) {
    text += block.numbered_list_item.rich_text
      .map(rt => rt.plain_text || '')
      .join('')
  } else if (block.type === 'quote' && block.quote?.rich_text) {
    text += block.quote.rich_text.map(rt => rt.plain_text || '').join('')
  } else if (block.type === 'code' && block.code?.rich_text) {
    text += block.code.rich_text.map(rt => rt.plain_text || '').join('')
  }

  return text
}

export async function getPageTextContent(pageId: string): Promise<string> {
  try {
    const response = await notion.blocks.children.list({
      block_id: pageId,
    })

    let textContent = ''

    for (const block of response.results) {
      textContent += extractTextFromBlock(block as NotionBlock) + ' '
    }

    return textContent.trim()
  } catch (error) {
    console.error('Error extracting text content:', error)
    return ''
  }
}

export async function generateExcerpt(
  pageId: string,
  maxLength: number = 200
): Promise<string> {
  try {
    const textContent = await getPageTextContent(pageId)

    if (textContent.length <= maxLength) {
      return textContent
    }

    // Find the last complete sentence within the limit
    const truncated = textContent.substring(0, maxLength)
    const lastSentenceEnd = Math.max(
      truncated.lastIndexOf('.'),
      truncated.lastIndexOf('!'),
      truncated.lastIndexOf('?')
    )

    if (lastSentenceEnd > maxLength * 0.5) {
      return truncated.substring(0, lastSentenceEnd + 1).trim()
    }

    // If no sentence end found, just truncate at word boundary
    const lastSpace = truncated.lastIndexOf(' ')
    return lastSpace > 0
      ? truncated.substring(0, lastSpace).trim() + '...'
      : truncated.trim() + '...'
  } catch (error) {
    console.error('Error generating excerpt:', error)
    return ''
  }
}

export interface TagWithCount {
  name: string
  slug: string
  count: number
}

export interface CategoryWithCount {
  name: string
  slug: string
  count: number
}

// slugify function imported from slug-utils

// Optimized functions that reuse cached data
export async function getAllTags(): Promise<TagWithCount[]> {
  const posts = await getPosts()
  const tagCounts = new Map<string, number>()

  posts.forEach(post => {
    post.tags.forEach(tag => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
    })
  })

  return Array.from(tagCounts.entries())
    .map(([name, count]) => ({
      name,
      slug: slugify(name),
      count,
    }))
    .sort((a, b) => b.count - a.count)
}

export async function getAllCategories(): Promise<CategoryWithCount[]> {
  const posts = await getPosts()
  const categoryCounts = new Map<string, number>()

  posts.forEach(post => {
    if (post.category) {
      categoryCounts.set(
        post.category,
        (categoryCounts.get(post.category) || 0) + 1
      )
    }
  })

  return Array.from(categoryCounts.entries())
    .map(([name, count]) => ({
      name,
      slug: slugify(name),
      count,
    }))
    .sort((a, b) => b.count - a.count)
}

export async function getPostsByTag(tagName: string): Promise<NotionPost[]> {
  const posts = await getPosts()
  return posts.filter(post =>
    post.tags.some(tag => slugify(tag) === slugify(tagName))
  )
}

export async function getPostsByCategory(
  categoryName: string
): Promise<NotionPost[]> {
  const posts = await getPosts()
  return posts.filter(
    post => post.category && slugify(post.category) === slugify(categoryName)
  )
}

// Optimized function to get posts with metadata in a single call
export async function getPostsWithMetadata(): Promise<{
  posts: NotionPost[]
  tags: TagWithCount[]
  categories: CategoryWithCount[]
}> {
  const posts = await getPosts()

  // Calculate tags and categories from the same posts array
  const tagCounts = new Map<string, number>()
  const categoryCounts = new Map<string, number>()

  posts.forEach(post => {
    // Process tags
    post.tags.forEach(tag => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
    })

    // Process categories
    if (post.category) {
      categoryCounts.set(
        post.category,
        (categoryCounts.get(post.category) || 0) + 1
      )
    }
  })

  const tags = Array.from(tagCounts.entries())
    .map(([name, count]) => ({
      name,
      slug: slugify(name),
      count,
    }))
    .sort((a, b) => b.count - a.count)

  const categories = Array.from(categoryCounts.entries())
    .map(([name, count]) => ({
      name,
      slug: slugify(name),
      count,
    }))
    .sort((a, b) => b.count - a.count)

  return { posts, tags, categories }
}
