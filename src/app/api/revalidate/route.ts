import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')

    // 보안을 위한 시크릿 키 검증
    if (secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
    }

    const body = await request.json()
    const { type, paths, tags } = body

    switch (type) {
      case 'path':
        // 특정 경로들 재검증
        if (paths && Array.isArray(paths)) {
          for (const path of paths) {
            revalidatePath(path)
            console.log(`Revalidated path: ${path}`)
          }
          return NextResponse.json({
            revalidated: true,
            paths,
            timestamp: new Date().toISOString(),
          })
        }
        break

      case 'tag':
        // 태그 기반 재검증
        if (tags && Array.isArray(tags)) {
          for (const tag of tags) {
            revalidateTag(tag)
            console.log(`Revalidated tag: ${tag}`)
          }
          return NextResponse.json({
            revalidated: true,
            tags,
            timestamp: new Date().toISOString(),
          })
        }
        break

      case 'all':
        // 모든 주요 페이지 재검증
        revalidatePath('/', 'layout')
        console.log(`Revalidated Whole path`)

        return NextResponse.json({
          revalidated: true,
          // paths: allPaths,
          message: 'All main pages revalidated',
          timestamp: new Date().toISOString(),
        })

      case 'post-related':
        // 포스트 관련 모든 페이지 재검증 (새 포스트 추가 시)
        const postRelatedPaths = ['/', '/posts', '/tags', '/categories']

        for (const path of postRelatedPaths) {
          revalidatePath(path)
        }

        // 태그 기반 재검증도 함께
        revalidateTag('posts')

        return NextResponse.json({
          revalidated: true,
          paths: postRelatedPaths,
          tags: ['posts'],
          message: 'Post-related pages revalidated',
          timestamp: new Date().toISOString(),
        })

      default:
        return NextResponse.json(
          { error: 'Invalid type. Use: path, tag, all, or post-related' },
          { status: 400 }
        )
    }

    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Revalidation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET 요청으로 현재 상태 확인
export async function GET() {
  return NextResponse.json({
    message: 'Revalidation API is running',
    usage: {
      'POST /api/revalidate?secret=YOUR_SECRET': {
        'path revalidation': {
          type: 'path',
          paths: ['/path1', '/path2'],
        },
        'tag revalidation': {
          type: 'tag',
          tags: ['tag1', 'tag2'],
        },
        'all pages': {
          type: 'all',
        },
        'post-related': {
          type: 'post-related',
        },
      },
    },
    timestamp: new Date().toISOString(),
  })
}
