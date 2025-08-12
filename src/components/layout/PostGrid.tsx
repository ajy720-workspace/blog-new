import type { NotionPost } from '@/types/notion'

import { FeaturedPostGrid, OptimizedPostGrid } from './OptimizedPostGrid'

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
}: PostGridProps) {
  // Convert old layout to new layout
  const mappedLayout = layout === 'masonry' ? 'grid' : layout

  // Add excerpts to posts
  const postsWithExcerpts = posts.map(post => ({
    ...post,
    excerpt: excerpts?.[post.id],
  }))

  return (
    <OptimizedPostGrid
      posts={postsWithExcerpts}
      layout={mappedLayout}
      columns={columns}
      className={className}
      animate={animate}
    />
  )
}

// Responsive post grid with automatic layout switching
export function ResponsivePostGrid({
  posts,
  excerpts = {},
  className = '',
  animate = true,
}: Omit<PostGridProps, 'layout' | 'columns'>) {
  const postsWithExcerpts = posts.map(post => ({
    ...post,
    excerpt: excerpts?.[post.id],
  }))

  if (posts.length === 0) {
    return (
      <OptimizedPostGrid
        posts={postsWithExcerpts}
        layout="grid"
        className={className}
        animate={animate}
      />
    )
  }

  if (posts.length === 1) {
    return (
      <OptimizedPostGrid
        posts={postsWithExcerpts}
        layout="list"
        className={className}
        animate={animate}
      />
    )
  }

  if (posts.length <= 4) {
    return (
      <OptimizedPostGrid
        posts={postsWithExcerpts}
        layout="grid"
        columns={2}
        className={className}
        animate={animate}
      />
    )
  }

  return (
    <FeaturedPostGrid
      posts={postsWithExcerpts}
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
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
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
        className=""
      />
    </div>
  )
}
