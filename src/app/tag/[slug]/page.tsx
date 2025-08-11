import { Suspense } from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  getPostsByTag,
  getAllTags,
  generateExcerpt,
  TagWithCount,
} from '@/lib/core/notion'
import { PostCard } from '@/components/post-card'
import { PostCardWithHero } from '@/components/PostCardWithHero'
import { OptimizedPostGrid } from '@/components/layout/OptimizedPostGrid'
import { BreadcrumbNav } from '@/components/SEO/BreadcrumbNav'
import {
  PostGridSkeleton,
  RelatedItemsSkeleton,
  PageHeaderSkeleton,
} from '@/components/ui/loading-states'
import { Tag, Calendar } from 'lucide-react'
import Link from 'next/link'
import { slugify } from '@/lib/utils/slug-utils'

export const revalidate = 3600 // ISR: 1시간마다 재검증

interface TagPageProps {
  params: Promise<{
    slug: string
  }>
}

// Helper function to find tag with URL decoding and fallback logic
function findTagBySlug(
  tags: TagWithCount[],
  slug: string
): TagWithCount | undefined {
  // Try direct match first
  let tag = tags.find(t => t.slug === slug)
  if (tag) return tag

  // Try URL decoded version
  try {
    const decodedSlug = decodeURIComponent(slug)
    tag = tags.find(t => t.slug === decodedSlug)
    if (tag) return tag

    // Try slugified version of decoded slug
    const normalizedSlug = slugify(decodedSlug)
    tag = tags.find(t => t.slug === normalizedSlug)
    if (tag) return tag
  } catch {
    // URL decoding failed, continue with other methods
  }

  // Try finding by name and then slugify
  tag = tags.find(t => slugify(t.name) === slug)
  if (tag) return tag

  return undefined
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
  const tag = findTagBySlug(tags, slug)

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

async function TagHeader({ slug }: { slug: string }) {
  const tags = await getAllTags()
  const tag = findTagBySlug(tags, slug)

  if (!tag) {
    notFound()
  }

  return (
    <div className="mb-12">
      <BreadcrumbNav
        items={[
          { name: 'Home', url: '/' },
          { name: 'Tags', url: '/tags' },
          { name: `#${tag.name}`, url: `/tag/${tag.slug}` },
        ]}
        className="mb-6"
      />

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
  )
}

async function TagPosts({ slug }: { slug: string }) {
  const tags = await getAllTags()
  const tag = findTagBySlug(tags, slug)

  if (!tag) {
    notFound()
  }

  const posts = await getPostsByTag(tag.name)

  if (posts.length === 0) {
    return (
      <div className="text-center py-16">
        <Tag className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
        <h1 className="text-3xl font-bold mb-4">No posts found</h1>
        <p className="text-muted-foreground mb-8">
          There are no published posts tagged with &quot;{tag.name}&quot; yet.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
        >
          Browse all posts
        </Link>
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
        <OptimizedPostGrid
          posts={postsWithExcerpts
            .slice(1)
            .map(({ post, excerpt }) => ({ ...post, excerpt }))}
        />
      )}
    </div>
  )
}

async function RelatedTags({ currentSlug }: { currentSlug: string }) {
  const tags = await getAllTags()

  return (
    <div className="mt-16 pt-8 border-t">
      <h2 className="text-2xl font-bold mb-6">Explore Other Tags</h2>
      <div className="flex flex-wrap gap-3">
        {tags
          .filter(t => t.slug !== currentSlug)
          .slice(0, 10)
          .map(relatedTag => (
            <Link
              key={relatedTag.slug}
              href={`/tag/${relatedTag.slug}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-full text-sm font-medium transition-colors"
            >
              <Tag className="w-3 h-3" />
              {relatedTag.name}
              <span className="text-xs opacity-70">({relatedTag.count})</span>
            </Link>
          ))}
      </div>
    </div>
  )
}

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <Suspense fallback={<PageHeaderSkeleton />}>
          <TagHeader slug={slug} />
        </Suspense>

        {/* Posts Grid */}
        <Suspense fallback={<PostGridSkeleton count={6} />}>
          <TagPosts slug={slug} />
        </Suspense>

        {/* Related Tags */}
        <Suspense fallback={<RelatedItemsSkeleton count={10} />}>
          <RelatedTags currentSlug={slug} />
        </Suspense>
      </div>
    </div>
  )
}
