import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'

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
      // Notion 웹훅은 이벤트 타입을 명시적으로 제공하지 않으므로
      // 페이지 상태나 타임스탬프로 판단해야 함
      console.log(`Processing page event for page: ${pageId}`)

      // 페이지가 휴지통에 있으면 삭제로 판단
      const isDeleted = data?.in_trash || data?.archived
      const eventType = isDeleted ? 'deleted' : 'created/updated'

      console.log(`Event type: ${eventType} for page ${pageId}`)

      // 포스트 관련 모든 페이지 재검증
      const pathsToRevalidate = [
        '/', // 홈페이지 (최신 포스트, 태그, 카테고리)
        '/posts', // 전체 포스트 목록
        '/tags', // 태그 목록 (새 태그 추가 가능)
        '/categories', // 카테고리 목록 (새 카테고리 추가 가능)
      ]

      for (const path of pathsToRevalidate) {
        revalidatePath(path)
        console.log(`Revalidated path: ${path}`)
      }

      // 태그 기반 캐시도 무효화
      revalidateTag('posts')
      revalidateTag('tags')
      revalidateTag('categories')

      return NextResponse.json({
        success: true,
        message: `Successfully processed ${eventType} event`,
        page_id: pageId,
        revalidated_paths: pathsToRevalidate,
        revalidated_tags: ['posts', 'tags', 'categories'],
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
    },
    timestamp: new Date().toISOString(),
  })
}
