import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { Calendar, Tag, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { getPostBySlug, getPageContent } from '@/lib/notion'
import { PostRenderer } from '@/components/post-renderer'

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

  const blocks = await getPageContent(post.id)

  const formattedDate = new Date(post.created_time).toLocaleDateString(
    'en-US',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
  )

  return (
    <article className="max-w-4xl mx-auto">
      <header className="mb-8 pb-8 border-b">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to posts
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <time dateTime={post.created_time}>{formattedDate}</time>
          </div>

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
      </header>

      <div className="prose prose-lg max-w-none dark:prose-invert">
        <PostRenderer blocks={blocks} />
      </div>
    </article>
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
    }
  }

  return {
    title: post.title,
    description: `Posted on ${new Date(post.created_time).toLocaleDateString()}`,
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
