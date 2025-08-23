import { Suspense } from 'react'
import { cache } from 'react'

import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Calendar, Tag } from 'lucide-react'

import { AdBanner } from '@/components/ads/AdBanner'
import { CommentCount } from '@/components/comments'
import { HeroImage, LazyComments } from '@/components/common'
import { PostActions, PostRenderer } from '@/components/post'
import { StructuredData } from '@/components/seo'
import { PostBreadcrumbs } from '@/components/seo/BreadcrumbNav'
import { CommentSkeleton } from '@/components/ui/loading-states'
import { seoConfig, siteConfig } from '@/config'
import { LikeProvider } from '@/contexts/LikeContext'
import {
  getPageContent,
  getPageTextContent,
  getPostBySlug,
  getPostsWithMetadata,
} from '@/lib/core/notion'
import {
  generateMetaDescription,
  generateOpenGraphTags,
  generatePostSchema,
  getCanonicalUrl,
  optimizeTitle,
} from '@/lib/core/seo'
import { slugify } from '@/lib/utils/slug-utils'
import { NotionPost } from '@/types/notion'

export const revalidate = 3600 // ISR: 1시간마다 재검증 (다른 페이지와 동일한 간격으로 조정)
export const dynamicParams = true // 빌드 시 생성되지 않은 동적 경로 허용

// 캐시된 textContent 가져오기 (generateMetadata와 PostContent에서 공유)
const getCachedPageTextContent = cache(async (postId: string) => {
  return await getPageTextContent(postId)
})

// generateStaticParams: 빌드 타임에 모든 포스트 페이지를 미리 생성
export async function generateStaticParams() {
  try {
    const { posts } = await getPostsWithMetadata()

    console.log(`Generated static params for ${posts.length} posts`)
    return posts.map(post => ({
      slug: post.url_path,
    }))
  } catch (error) {
    console.error('Error generating static params for posts:', error)
    // 에러 시에도 빈 배열 반환하여 동적 생성 허용
    return []
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

  const breadcrumbItems = [{ name: 'Home', url: '/' }]
  if (post.category) {
    breadcrumbItems.push({
      name: post.category,
      url: `/category/${slugify(post.category)}`,
    })
  }
  breadcrumbItems.push({ name: post.title, url: `/${post.url_path}` })

  return (
    <>
      <StructuredData data={postSchema} />
      <LikeProvider notionPageId={post.id}>
        <article className="max-w-4xl mx-auto">
          <header className="mb-8 pb-8 border-b">
            <PostBreadcrumbs post={post} className="mb-6" />

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
                        <a
                          key={tag}
                          href={`/tag/${slugify(tag)}`}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors"
                        >
                          {tag}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <PostActions
                notionPageId={post.id}
                title={post.title}
                url={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://blog.ajy720.me'}/${post.url_path}`}
                description={post.title}
                showLikeCount={true}
              />
            </div>
            {post.coverImage && (
              <HeroImage
                coverImage={post.coverImage}
                title={post.title}
                createdAt={post.created_time}
                postId={post.id}
                className="mt-8 h-48 md:h-64"
                showOverlay={false}
                priority={true}
              />
            )}
          </header>

          <div className="prose prose-lg max-w-none dark:prose-invert">
            <PostRenderer blocks={blocks} />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-6 mt-8 md:mt-12 lg:mt-16">
            {/* Footer Tags */}
            {post.tags.length > 0 && (
              <div className="">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Tags:
                  </span>
                  {post.tags.map(tag => (
                    <a
                      key={tag}
                      href={`/tag/${slugify(tag)}`}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors"
                    >
                      {tag}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Post Actions at Bottom */}
            <div className="">
              <PostActions
                notionPageId={post.id}
                title={post.title}
                url={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://blog.ajy720.me'}/${post.url_path}`}
                description={post.title}
                showLikeCount={true}
              />
            </div>
          </div>
        </article>
      </LikeProvider>
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
    siteName: seoConfig.openGraph.siteName,
    image: post.coverImage,
    createTime: post.created_time,
    tags: post.tags,
  }

  return {
    title: optimizedTitle,
    description,
    keywords: post.tags.length > 0 ? post.tags.join(', ') : undefined,
    authors: [{ name: siteConfig.author.name }],
    creator: siteConfig.author.name,
    publisher: siteConfig.name,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: generateOpenGraphTags(openGraphData),
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

      {/* 게시글 하단 광고 배너 */}
      <div className="max-w-4xl mx-auto">
        <AdBanner position="post-bottom" />
      </div>

      <section
        id="comments"
        className="max-w-4xl mx-auto mt-8 md:mt-12 lg:mt-16"
      >
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

      {/* 사이드 플로팅 광고 배너 */}
      <AdBanner position="side-floating" />
    </main>
  )
}
