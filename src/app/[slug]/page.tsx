import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { Calendar, Tag, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { getPostBySlug, getPageContent, getPageTextContent } from '@/lib/notion'
import { LazyPostRenderer, LazySocialShare, LazyComments } from '@/components/LazyComponents'
import {
  generatePostSchema,
  generateBreadcrumbSchema,
  generateMetaDescription,
  optimizeTitle,
  getCanonicalUrl,
  generateOpenGraphTags,
} from '@/lib/seo'
import { StructuredData } from '@/components/SEO/StructuredData'
import { CommentCount } from '@/components/Comments'
import { getComments, getCommentCount } from '@/lib/supabase/comments'

interface PostPageProps {
  params: Promise<{
    slug: string
  }>
}

async function PostContent({ slug }: { slug: string }) {
  const post = await getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const [blocks, textContent, comments, commentCount] = await Promise.all([
    getPageContent(post.id),
    getPageTextContent(post.id),
    getComments(post.id),
    getCommentCount(post.id),
  ])

  const formattedDate = new Date(post.created_time).toLocaleDateString(
    'en-US',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
  )

  const postSchema = generatePostSchema(post, textContent)
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: post.title, url: `/${post.url_path}` },
  ])

  return (
    <>
      <StructuredData data={[postSchema, breadcrumbSchema]} />
      <article className="max-w-4xl mx-auto">
        <header className="mb-8 pb-8 border-b">
          <nav aria-label="Breadcrumb">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to posts
            </Link>
          </nav>

          <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <time dateTime={post.created_time}>{formattedDate}</time>
              </div>

              <CommentCount count={commentCount} />

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

            <Suspense fallback={<div className="w-32 h-8 bg-muted rounded animate-pulse"></div>}>
              <LazySocialShare
                title={post.title}
                url={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'}/${post.url_path}`}
                description={
                  textContent ? generateMetaDescription(textContent) : post.title
                }
              />
            </Suspense>
          </div>
        </header>

        <div className="prose prose-lg max-w-none dark:prose-invert">
          <Suspense fallback={
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
              <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
              <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
              <div className="h-32 bg-muted rounded w-full animate-pulse"></div>
            </div>
          }>
            <LazyPostRenderer blocks={blocks} />
          </Suspense>
        </div>
      </article>

      <section className="max-w-4xl mx-auto mt-16">
        <Suspense fallback={
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded w-48 animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-16 bg-muted rounded w-full animate-pulse"></div>
              <div className="h-16 bg-muted rounded w-full animate-pulse"></div>
            </div>
          </div>
        }>
          <LazyComments notionPageId={post.id} initialComments={comments} />
        </Suspense>
      </section>
    </>
  )
}

function PostSkeleton() {
  return (
    <div className="max-w-4xl mx-auto animate-pulse">
      <div className="mb-8 pb-8 border-b">
        <div className="h-4 bg-muted rounded w-24 mb-6"></div>
        <div className="h-10 bg-muted rounded w-3/4 mb-4"></div>
        <div className="flex gap-6">
          <div className="h-4 bg-muted rounded w-32"></div>
          <div className="h-4 bg-muted rounded w-24"></div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="h-4 bg-muted rounded w-full"></div>
        <div className="h-4 bg-muted rounded w-full"></div>
        <div className="h-4 bg-muted rounded w-3/4"></div>
      </div>
    </div>
  )
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

  const textContent = await getPageTextContent(post.id)
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
    siteName: 'Blog',
  }

  return {
    title: optimizedTitle,
    description,
    keywords: post.tags.length > 0 ? post.tags.join(', ') : undefined,
    authors: [{ name: 'Blog Author' }],
    creator: 'Blog Author',
    publisher: 'Blog',
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      ...generateOpenGraphTags(openGraphData),
      type: 'article',
      publishedTime: post.created_time,
      authors: ['Blog Author'],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: optimizedTitle,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default async function PostPage(props: PostPageProps) {
  const params = await props.params
  return (
    <main className="container mx-auto px-4 py-8">
      <Suspense fallback={<PostSkeleton />}>
        <PostContent slug={params.slug} />
      </Suspense>
    </main>
  )
}
