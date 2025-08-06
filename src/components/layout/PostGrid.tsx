'use client'

import { NotionPost } from '@/types/notion'
import { PostCard } from '@/components/post-card'
import { PostCardWithHero } from '@/components/PostCardWithHero'
import { StaggeredGrid } from '@/components/animations/StaggeredList'
import { cn } from '@/lib/utils'

interface PostGridProps {
  posts: NotionPost[]
  excerpts?: Record<string, string>
  layout?: 'grid' | 'masonry' | 'list' | 'featured'
  columns?: 1 | 2 | 3 | 4
  className?: string
  animate?: boolean
  featuredFirst?: boolean
}

export function PostGrid({
  posts,
  excerpts = {},
  layout = 'grid',
  columns = 3,
  className = '',
  animate = true,
  featuredFirst = true,
}: PostGridProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 mx-auto bg-secondary rounded-full flex items-center justify-center">
            <div className="w-8 h-8 bg-muted rounded" />
          </div>
          <h3 className="text-lg font-semibold">No posts found</h3>
          <p className="text-muted-foreground">
            There are no posts to display at the moment.
          </p>
        </div>
      </div>
    )
  }

  const getGridClasses = () => {
    const baseClass = 'grid gap-6'

    switch (layout) {
      case 'list':
        return `${baseClass} grid-cols-1`
      case 'masonry':
        return `${baseClass} columns-1 md:columns-2 lg:columns-${columns} space-y-6`
      case 'featured':
        return `${baseClass} grid-cols-1 lg:grid-cols-4 lg:grid-rows-3`
      default:
        return `${baseClass} grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns}`
    }
  }

  const renderPost = (post: NotionPost, index: number) => {
    const excerpt = excerpts[post.id]
    const hasCoverImage = !!post.coverImage

    // Featured layout logic
    if (layout === 'featured' && index === 0 && featuredFirst) {
      return hasCoverImage ? (
        <PostCardWithHero
          key={post.id}
          post={post}
          excerpt={excerpt}
          variant="featured"
          className="lg:col-span-2 lg:row-span-2"
        />
      ) : (
        <PostCard
          key={post.id}
          post={post}
          excerpt={excerpt}
          variant="featured"
          className="lg:col-span-2 lg:row-span-2"
        />
      )
    }

    // List layout
    if (layout === 'list') {
      return hasCoverImage ? (
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
    }

    // Masonry layout
    if (layout === 'masonry') {
      return (
        <div key={post.id} className="break-inside-avoid mb-6">
          {hasCoverImage ? (
            <PostCardWithHero post={post} excerpt={excerpt} variant="compact" />
          ) : (
            <PostCard post={post} excerpt={excerpt} variant="default" />
          )}
        </div>
      )
    }

    // Default grid layout
    return hasCoverImage ? (
      <PostCardWithHero
        key={post.id}
        post={post}
        excerpt={excerpt}
        variant="default"
      />
    ) : (
      <PostCard key={post.id} post={post} excerpt={excerpt} variant="default" />
    )
  }

  const postElements = posts.map((post, index) => renderPost(post, index))

  if (!animate) {
    return <div className={cn(getGridClasses(), className)}>{postElements}</div>
  }

  if (layout === 'masonry') {
    return <div className={cn(getGridClasses(), className)}>{postElements}</div>
  }

  return (
    <StaggeredGrid
      className={cn(getGridClasses(), className)}
      staggerDelay={100}
      duration={600}
      triggerOnce={true}
    >
      {postElements}
    </StaggeredGrid>
  )
}

// Responsive post grid with automatic layout switching
export function ResponsivePostGrid({
  posts,
  excerpts = {},
  className = '',
  animate = true,
}: Omit<PostGridProps, 'layout' | 'columns'>) {
  if (posts.length === 0) {
    return <PostGrid posts={posts} excerpts={excerpts} className={className} />
  }

  if (posts.length === 1) {
    return (
      <PostGrid
        posts={posts}
        excerpts={excerpts}
        layout="list"
        className={className}
        animate={animate}
      />
    )
  }

  if (posts.length <= 4) {
    return (
      <PostGrid
        posts={posts}
        excerpts={excerpts}
        layout="grid"
        columns={2}
        className={className}
        animate={animate}
      />
    )
  }

  return (
    <PostGrid
      posts={posts}
      excerpts={excerpts}
      layout="featured"
      className={className}
      animate={animate}
    />
  )
}

// Category showcase grid for homepage
export function CategoryShowcaseGrid({
  posts,
  excerpts = {},
  categoryName,
  viewAllUrl,
  className = '',
  maxPosts = 6,
}: Omit<PostGridProps, 'layout' | 'columns'> & {
  categoryName: string
  viewAllUrl: string
  maxPosts?: number
}) {
  const showcasePosts = posts.slice(0, maxPosts)

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{categoryName}</h2>
        <a
          href={viewAllUrl}
          className="text-sm text-primary hover:text-primary/80 font-medium"
        >
          View all →
        </a>
      </div>

      {/* Posts */}
      <ResponsivePostGrid
        posts={showcasePosts}
        excerpts={excerpts}
        animate={true}
      />
    </div>
  )
}
