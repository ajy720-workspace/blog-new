import { Client } from '@notionhq/client'

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
      property: 'Published',
      checkbox: {
        equals: true,
      },
    },
    sorts: [
      {
        property: 'Created',
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
    const createdProp = properties.Created as { created_time?: string }
    const tagsProp = properties.Tags as { multi_select?: { name: string }[] }
    const publishedProp = properties.Published as { checkbox?: boolean }

    return {
      id: pageData.id as string,
      title: titleProp?.title?.[0]?.plain_text || 'Untitled',
      url_path:
        urlPathProp?.rich_text?.[0]?.plain_text || (pageData.id as string),
      created_time:
        createdProp?.created_time || (pageData.created_time as string),
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
  const createdProp = properties.Created as { created_time?: string }
  const tagsProp = properties.Tags as { multi_select?: { name: string }[] }
  const publishedProp = properties.Published as { checkbox?: boolean }

  return {
    id: pageData.id as string,
    title: titleProp?.title?.[0]?.plain_text || 'Untitled',
    url_path:
      urlPathProp?.rich_text?.[0]?.plain_text || (pageData.id as string),
    created_time:
      createdProp?.created_time || (pageData.created_time as string),
    tags: tagsProp?.multi_select?.map(tag => tag.name) || [],
    published: publishedProp?.checkbox || false,
  }
}

export async function getPageContent(pageId: string) {
  const response = await notion.blocks.children.list({
    block_id: pageId,
  })

  return response.results
}
