import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { Calendar, Tag } from 'lucide-react'
import { cache } from 'react'
import {
  getPostBySlug,
  getPageContent,
  getPageTextContent,
  getPostsWithMetadata,
  NotionPost,
} from '@/lib/notion'
import { PostRenderer } from '@/components/post-renderer'
import { LazySocialShare, LazyComments } from '@/components/LazyComponents'
import {
  generatePostSchema,
  generateMetaDescription,
  optimizeTitle,
  getCanonicalUrl,
  generateOpenGraphTags,
} from '@/lib/seo'
import { StructuredData } from '@/components/SEO/StructuredData'
import { BreadcrumbNav } from '@/components/SEO/BreadcrumbNav'
import { CommentSkeleton } from '@/components/ui/loading-states'
import { CommentCount } from '@/components/Comments'

export const revalidate = 7200 // ISR: 2시간마다 재검증 (개별 포스트는 더 긴 간격)

// 캐시된 textContent 가져오기 (generateMetadata와 PostContent에서 공유)
const getCachedPageTextContent = cache(async (postId: string) => {
  return await getPageTextContent(postId)
})

// generateStaticParams: 빌드 타임에 모든 포스트 페이지를 미리 생성
export async function generateStaticParams() {
  try {
    const { posts } = await getPostsWithMetadata()

    return posts.map(post => ({
      slug: post.url_path,
    }))
  } catch (error) {
    console.error('Error generating static params:', error)
    return [] // 에러 시 빈 배열 반환 (동적 생성으로 폴백)
  }
}

interface PostPageProps {
  params: Promise<{
    slug: string
  }>
}

async function PostContent({ post }: { post: NotionPost }) {
  const [blocks, textContent] = await Promise.all([
    getPageContent(post.id),
    getCachedPageTextContent(post.id), // generateMetadata에서 이미 캐시된 데이터 재사용
  ])

  const formattedDate = new Date(post.created_time).toLocaleDateString(
    'en-US',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
  )

  // 캐시된 textContent를 사용하여 완전한 Structured Data 생성
  const postSchema = generatePostSchema(post, textContent)
  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: post.title, url: `/${post.url_path}` },
  ]

  return (
    <>
      <StructuredData data={postSchema} />
      <article className="max-w-4xl mx-auto">
        <header className="mb-8 pb-8 border-b">
          <BreadcrumbNav items={breadcrumbItems} className="mb-6" />

          <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <time dateTime={post.created_time}>{formattedDate}</time>
              </div>

              {/* 댓글 수는 클라이언트에서 로딩 */}
              <CommentCount notionPageId={post.id} />

              {post.tags.length > 0 && (
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Suspense
              fallback={
                <div className="w-32 h-8 bg-muted rounded animate-pulse"></div>
              }
            >
              <LazySocialShare
                title={post.title}
                url={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://blog.ajy720.me'}/${post.url_path}`}
                description={post.title}
              />
            </Suspense>
          </div>
        </header>

        <div className="prose prose-lg max-w-none dark:prose-invert">
          <PostRenderer blocks={blocks} />
        </div>
      </article>
    </>
  )
}

function PostComments({ postId }: { postId: string }) {
  // 서버사이드 댓글 로딩 제거 - 완전히 클라이언트사이드에서 처리
  return <LazyComments notionPageId={postId} initialComments={[]} />
}

export async function generateMetadata(
  props: PostPageProps
): Promise<Metadata> {
  const params = await props.params
  const post = await getPostBySlug(params.slug)

  if (!post) {
    return {
      title: 'Post Not Found',
      description: 'The requested blog post could not be found.',
    }
  }

  const textContent = await getCachedPageTextContent(post.id)
  const description = textContent
    ? generateMetaDescription(textContent)
    : `${post.title} - Posted on ${new Date(post.created_time).toLocaleDateString()}`

  const optimizedTitle = optimizeTitle(post.title)
  const canonicalUrl = getCanonicalUrl(`/${post.url_path}`)

  const openGraphData = {
    title: optimizedTitle,
    description,
    url: canonicalUrl,
    type: 'article' as const,
    siteName: 'Blog - ajy720',
  }

  return {
    title: optimizedTitle,
    description,
    keywords: post.tags.length > 0 ? post.tags.join(', ') : undefined,
    authors: [{ name: 'Hyeonseok An' }],
    creator: 'Hyeonseok An',
    publisher: "ajy720's Blog",
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      ...generateOpenGraphTags(openGraphData),
      type: 'article',
      publishedTime: post.created_time,
      authors: ['Hyeonseok An'],
      tags: post.tags,
      ...(post.coverImage && {
        images: [{ url: post.coverImage, alt: post.title }],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: optimizedTitle,
      description,
      ...(post.coverImage && { images: [post.coverImage] }),
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default async function PostPage(props: PostPageProps) {
  const params = await props.params
  const post = await getPostBySlug(params.slug)

  if (!post) {
    notFound()
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <PostContent post={post} />

      <section className="max-w-4xl mx-auto mt-16">
        <Suspense
          fallback={
            <div className="space-y-6">
              <div className="h-8 bg-muted rounded w-48 animate-pulse"></div>
              <CommentSkeleton />
              <CommentSkeleton />
              <CommentSkeleton />
            </div>
          }
        >
          <PostComments postId={post.id} />
        </Suspense>
      </section>
    </main>
  )
}
