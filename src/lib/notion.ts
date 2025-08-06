import { Client } from '@notionhq/client'
import { NotionAPI } from 'notion-client'

// you can optionally pass an authToken to access private notion resources
const api = new NotionAPI({
  authToken: process.env.NOTION_AUTH_TOKEN,
  activeUser: process.env.NOTION_ACTIVE_USER,
})

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
}

export async function getPosts(): Promise<NotionPost[]> {
  if (!process.env.NOTION_DATABASE_ID) {
    throw new Error('NOTION_DATABASE_ID is not defined')
  }

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

  return response.results.map((page: unknown) => {
    const pageData = page as Record<string, unknown>
    const properties = (pageData.properties as Record<string, unknown>) || {}
    const titleProp = properties.Title as { title?: { plain_text?: string }[] }
    const urlPathProp = properties.URLPath as {
      rich_text?: { plain_text?: string }[]
    }

    const createdProp = properties.PublishedAt as { date?: { start: string } }
    const tagsProp = properties.Tags as { multi_select?: { name: string }[] }
    const publishedProp = properties.Published as { checkbox?: boolean }

    return {
      id: pageData.id as string,
      title: titleProp?.title?.[0]?.plain_text || 'Untitled',
      url_path:
        urlPathProp?.rich_text?.[0]?.plain_text || (pageData.id as string),
      created_time:
        createdProp?.date?.start || (pageData.created_time as string),
      tags: tagsProp?.multi_select?.map(tag => tag.name) || [],
      published: publishedProp?.checkbox || false,
    }
  })
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
  const properties = (pageData.properties as Record<string, unknown>) || {}
  const titleProp = properties.Title as { title?: { plain_text?: string }[] }
  const urlPathProp = properties.URLPath as {
    rich_text?: { plain_text?: string }[]
  }
  const createdProp = properties.PublishedAt as { date?: { start: string } }
  const tagsProp = properties.Tags as { multi_select?: { name: string }[] }
  const publishedProp = properties.Published as { checkbox?: boolean }

  return {
    id: pageData.id as string,
    title: titleProp?.title?.[0]?.plain_text || 'Untitled',
    url_path:
      urlPathProp?.rich_text?.[0]?.plain_text || (pageData.id as string),
    created_time: createdProp?.date?.start || (pageData.created_time as string),
    tags: tagsProp?.multi_select?.map(tag => tag.name) || [],
    published: publishedProp?.checkbox || false,
  }
}

export async function getPageContent(pageId: string) {
  /* 
  const response = await notion.blocks.children.list({
    block_id: pageId,
    }) 
  */
  const response = await api.getPage(pageId)

  return response
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
