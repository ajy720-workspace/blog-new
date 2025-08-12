import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

// Notion properties 타입 정의
interface NotionRichText {
  plain_text?: string
}

interface NotionSelect {
  name?: string
}

interface NotionFormula {
  string?: string
}

interface NotionProperty {
  rich_text?: NotionRichText[]
  title?: NotionRichText[]
  select?: NotionSelect
  multi_select?: NotionSelect[]
  formula?: NotionFormula
}

// Notion properties에서 값 추출하는 헬퍼 함수들
function extractPropertyValue(
  property: NotionProperty | undefined
): string | null {
  if (!property) return null

  // Rich Text (제목, 텍스트 등)
  if (property.rich_text && Array.isArray(property.rich_text)) {
    return property.rich_text.map(text => text.plain_text || '').join('')
  }

  // Title
  if (property.title && Array.isArray(property.title)) {
    return property.title.map(text => text.plain_text || '').join('')
  }

  // Select (카테고리 등)
  if (property.select && property.select.name) {
    return property.select.name
  }

  // Formula
  if (property.formula && property.formula.string) {
    return property.formula.string
  }

  return null
}

function extractPropertyArray(property: NotionProperty | undefined): string[] {
  if (!property) return []

  // Multi-select (태그 등)
  if (property.multi_select && Array.isArray(property.multi_select)) {
    return property.multi_select.map(item => item.name || '').filter(Boolean)
  }

  return []
}

export async function POST(request: NextRequest) {
  try {
    // 커스텀 헤더에서 시크릿 검증
    const webhookSecret = request.headers.get('x-webhook-secret')
    const source = request.headers.get('x-source')
    const contentType = request.headers.get('content-type')

    // 시크릿 키 검증
    if (!webhookSecret || webhookSecret !== process.env.NOTION_WEBHOOK_SECRET) {
      console.error('Invalid webhook secret')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 소스 검증 (추가 보안)
    if (source && source !== 'notion-blog-webhook') {
      console.error('Invalid webhook source')
      return NextResponse.json({ error: 'Invalid source' }, { status: 401 })
    }

    // Content-Type 검증
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { error: 'Invalid content type' },
        { status: 400 }
      )
    }

    const body = await request.text()

    if (!body) {
      return NextResponse.json({ error: 'Empty request body' }, { status: 400 })
    }

    const webhookData = JSON.parse(body)
    console.log('Notion webhook received:', {
      source,
      data: webhookData.data,
      timestamp: new Date().toISOString(),
    })

    // 실제 Notion 웹훅 데이터 구조 처리
    const { data } = webhookData
    const object = data?.object
    const pageId = data?.id

    // 페이지 관련 이벤트 (포스트 생성/수정/삭제)
    if (object === 'page') {
      console.log(`Processing page event for page: ${pageId}`)

      // 페이지가 휴지통에 있으면 삭제로 판단
      const isDeleted = data?.in_trash || data?.archived
      const eventType = isDeleted ? 'deleted' : 'created/updated'

      console.log(`Event type: ${eventType} for page ${pageId}`)

      // Properties에서 태그, 카테고리, URLPath 추출
      const properties: Record<string, NotionProperty> = data?.properties || {}
      const urlPath = extractPropertyValue(properties.URLPath)
      const tags = extractPropertyArray(properties.Tags)
      const category = extractPropertyValue(properties.Category)

      console.log(
        `Post details - URLPath: ${urlPath}, Tags: [${tags.join(', ')}], Category: ${category}`
      )

      // 기본 재검증 경로들
      const pathsToRevalidate = [
        '/', // 홈페이지 (최신 포스트, 태그, 카테고리)
        '/posts', // 전체 포스트 목록
        '/tags', // 태그 목록
        '/categories', // 카테고리 목록
      ]

      // 개별 포스트 페이지 추가 (URLPath가 있는 경우)
      if (urlPath) {
        pathsToRevalidate.push(`/${urlPath}`)
        console.log(`Added post page to revalidation: /${urlPath}`)
      }

      // 관련 태그 페이지들 추가
      if (tags.length > 0) {
        for (const tag of tags) {
          if (tag) {
            pathsToRevalidate.push(`/tag/${tag}`)
            console.log(`Added tag page to revalidation: /tag/${tag}`)
          }
        }
      }

      // 관련 카테고리 페이지 추가
      if (category) {
        pathsToRevalidate.push(`/category/${category}`)
        console.log(
          `Added category page to revalidation: /category/${category}`
        )
      }

      // 모든 경로 재검증 실행
      for (const path of pathsToRevalidate) {
        revalidatePath(path)
        console.log(`Revalidated path: ${path}`)
      }

      // 태그 기반 캐시도 무효화
      const revalidatedTags = ['posts', 'tags', 'categories']
      for (const tag of revalidatedTags) {
        revalidateTag(tag)
      }

      return NextResponse.json({
        success: true,
        message: `Successfully processed ${eventType} event`,
        page_id: pageId,
        post_details: {
          url_path: urlPath,
          tags: tags,
          category: category,
        },
        revalidated_paths: pathsToRevalidate,
        revalidated_tags: revalidatedTags,
        timestamp: new Date().toISOString(),
      })
    }

    // 데이터베이스 관련 이벤트 (스키마 변경 등)
    if (object === 'database') {
      console.log(`Database event for database: ${pageId}`)

      const allPaths = ['/', '/posts', '/tags', '/categories']

      for (const path of allPaths) {
        revalidatePath(path)
      }

      return NextResponse.json({
        success: true,
        message: 'Database updated, all pages revalidated',
        database_id: pageId,
        revalidated_paths: allPaths,
        timestamp: new Date().toISOString(),
      })
    }

    // 처리되지 않은 이벤트
    console.log(`Unhandled webhook event for object: ${object}`)
    return NextResponse.json({
      success: true,
      message: `Event received but not processed for object: ${object}`,
      data: data,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Notion webhook processing error:', error)
    return NextResponse.json(
      {
        error: 'Webhook processing failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// GET 요청으로 웹훅 상태 확인
export async function GET() {
  return NextResponse.json({
    message: 'Notion webhook endpoint is active',
    webhook_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/webhook/notion`,
    supported_events: [
      'page.created',
      'page.updated',
      'page.deleted',
      'database.updated',
    ],
    security: {
      custom_header_auth: !!process.env.NOTION_WEBHOOK_SECRET,
      required_headers: ['x-webhook-secret'],
      optional_headers: ['x-source'],
      content_type_check: true,
    },
    data_structure: {
      expected_format: 'webhookData.data.object',
      page_events: 'Inferred from data.in_trash and data.archived',
      properties_extraction: {
        urlPath: 'properties.URLPath (rich_text, title, formula)',
        tags: 'properties.Tags (multi_select)',
        category: 'properties.Category (select)',
      },
      intelligent_revalidation: {
        targeted_pages: ['/{urlPath}', '/tag/{tag}', '/category/{category}'],
        global_pages: ['/', '/posts', '/tags', '/categories'],
      },
    },
    timestamp: new Date().toISOString(),
  })
}
