import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPostsByTag, getAllTags, generateExcerpt } from '@/lib/notion'
import { PostCard } from '@/components/post-card'
import { PostCardWithHero } from '@/components/PostCardWithHero'
import { Tag, Calendar, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface TagPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  const tags = await getAllTags()
  return tags.map(tag => ({
    slug: tag.slug,
  }))
}

export async function generateMetadata({
  params,
}: TagPageProps): Promise<Metadata> {
  const { slug } = await params
  const tags = await getAllTags()
  const tag = tags.find(t => t.slug === slug)

  if (!tag) {
    return {
      title: 'Tag Not Found',
    }
  }

  return {
    title: `Posts tagged with "${tag.name}"`,
    description: `Browse all posts tagged with ${tag.name}. ${tag.count} posts available.`,
    openGraph: {
      title: `Posts tagged with "${tag.name}"`,
      description: `Browse all posts tagged with ${tag.name}. ${tag.count} posts available.`,
    },
  }
}

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params
  const tags = await getAllTags()
  const tag = tags.find(t => t.slug === slug)

  if (!tag) {
    notFound()
  }

  const posts = await getPostsByTag(tag.name)

  if (posts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/tags"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to all tags
          </Link>

          <div className="text-center py-16">
            <Tag className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h1 className="text-3xl font-bold mb-4">No posts found</h1>
            <p className="text-muted-foreground mb-8">
              There are no published posts tagged with &quot;{tag.name}&quot;
              yet.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Browse all posts
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Generate excerpts for posts
  const postsWithExcerpts = await Promise.all(
    posts.map(async post => ({
      post,
      excerpt: await generateExcerpt(post.id),
    }))
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/tags"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to all tags
          </Link>

          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Tag className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">#{tag.name}</h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {tag.count} {tag.count === 1 ? 'post' : 'posts'}
              </p>
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="space-y-8">
          {/* Featured post */}
          {postsWithExcerpts.length > 0 && (
            <div className="mb-12">
              {postsWithExcerpts[0].post.coverImage ? (
                <PostCardWithHero
                  post={postsWithExcerpts[0].post}
                  excerpt={postsWithExcerpts[0].excerpt}
                  variant="featured"
                />
              ) : (
                <PostCard
                  post={postsWithExcerpts[0].post}
                  excerpt={postsWithExcerpts[0].excerpt}
                  variant="featured"
                />
              )}
            </div>
          )}

          {/* Remaining posts */}
          {postsWithExcerpts.length > 1 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {postsWithExcerpts
                .slice(1)
                .map(({ post, excerpt }) =>
                  post.coverImage ? (
                    <PostCardWithHero
                      key={post.id}
                      post={post}
                      excerpt={excerpt}
                      variant="default"
                    />
                  ) : (
                    <PostCard
                      key={post.id}
                      post={post}
                      excerpt={excerpt}
                      variant="default"
                    />
                  )
                )}
            </div>
          )}
        </div>

        {/* Related Tags */}
        <div className="mt-16 pt-8 border-t">
          <h2 className="text-2xl font-bold mb-6">Explore Other Tags</h2>
          <div className="flex flex-wrap gap-3">
            {tags
              .filter(t => t.slug !== slug)
              .slice(0, 10)
              .map(relatedTag => (
                <Link
                  key={relatedTag.slug}
                  href={`/tag/${relatedTag.slug}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-full text-sm font-medium transition-colors"
                >
                  <Tag className="w-3 h-3" />
                  {relatedTag.name}
                  <span className="text-xs opacity-70">
                    ({relatedTag.count})
                  </span>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
