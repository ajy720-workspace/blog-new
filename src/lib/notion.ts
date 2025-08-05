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

// export async function getPosts(): Promise<NotionPost[]> {
//   if (!process.env.NOTION_DATABASE_ID) {
//     throw new Error('NOTION_DATABASE_ID is not defined')
//   }

//   const response = await notion.databases.query({
//     database_id: process.env.NOTION_DATABASE_ID,
//     filter: {
//       property: 'Published',
//       checkbox: {
//         equals: true,
//       },
//     },
//     sorts: [
//       {
//         property: 'Created',
//         direction: 'descending',
//       },
//     ],
//   })

//   return response.results.map((page: any) => ({
//     id: page.id,
//     title: page.properties.Title?.title?.[0]?.plain_text || 'Untitled',
//     url_path: page.properties.URLPath?.rich_text?.[0]?.plain_text || page.id,
//     created_time: page.properties.Created?.created_time || page.created_time,
//     tags: page.properties.Tags?.multi_select?.map((tag: any) => tag.name) || [],
//     published: page.properties.Published?.checkbox || false,
//   }))
// }

// export async function getPostBySlug(slug: string): Promise<NotionPost | null> {
//   if (!process.env.NOTION_DATABASE_ID) {
//     throw new Error('NOTION_DATABASE_ID is not defined')
//   }

//   const response = await notion.databases.query({
//     database_id: process.env.NOTION_DATABASE_ID,
//     filter: {
//       and: [
//         {
//           property: 'URLPath',
//           rich_text: {
//             equals: slug,
//           },
//         },
//         {
//           property: 'Published',
//           checkbox: {
//             equals: true,
//           },
//         },
//       ],
//     },
//   })

//   if (response.results.length === 0) {
//     return null
//   }

//   const page = response.results[0] as any
//   return {
//     id: page.id,
//     title: page.properties.Title?.title?.[0]?.plain_text || 'Untitled',
//     url_path: page.properties.URLPath?.rich_text?.[0]?.plain_text || page.id,
//     created_time: page.properties.Created?.created_time || page.created_time,
//     tags: page.properties.Tags?.multi_select?.map((tag: any) => tag.name) || [],
//     published: page.properties.Published?.checkbox || false,
//   }
// }

// export async function getPageContent(pageId: string) {
//   const response = await notion.blocks.children.list({
//     block_id: pageId,
//   })

//   return response.results
// }
