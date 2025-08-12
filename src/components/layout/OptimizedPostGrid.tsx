import { FileText, Grid } from 'lucide-react'

import {
  StaggeredGrid,
  StaggeredList,
} from '@/components/animations/StaggeredList'
import { PostCard } from '@/components/shared/PostCard'
import { EmptyState, PostCardSkeleton } from '@/components/ui/loading-states'
import { cn } from '@/lib/utils'
import { NotionPost } from '@/types/notion'

interface PostWithExcerpt extends NotionPost {
  excerpt?: string
}

interface OptimizedPostGridProps {
  posts: PostWithExcerpt[]
  layout?: 'grid' | 'list' | 'featured' | 'compact'
  columns?: 1 | 2 | 3 | 4
  className?: string
  animate?: boolean
  showExcerpts?: boolean
  showTags?: boolean
  showCategories?: boolean
  maxTags?: number
  emptyStateTitle?: string
  emptyStateDescription?: string
  loading?: boolean
  loadingCount?: number
}

const LAYOUT_CONFIGS = {
  grid: {
    containerClass: 'grid gap-6',
    getColumnsClass: (cols: number) => {
      const colsMap = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
      }
      return colsMap[cols as keyof typeof colsMap] || colsMap[3]
    },
    cardVariant: 'default' as const,
  },
  list: {
    containerClass: 'space-y-6',
    getColumnsClass: () => '',
    cardVariant: 'default' as const,
  },
  featured: {
    containerClass: 'space-y-8',
    getColumnsClass: () => '',
    cardVariant: 'featured' as const,
  },
  compact: {
    containerClass: 'space-y-4',
    getColumnsClass: () => '',
    cardVariant: 'compact' as const,
  },
}

export function OptimizedPostGrid({
  posts,
  layout = 'grid',
  columns = 3,
  className = '',
  animate = true,
  showExcerpts = true,
  showTags = true,
  showCategories = true,
  maxTags = 3,
  emptyStateTitle = 'No posts found',
  emptyStateDescription = 'There are no posts to display at the moment.',
  loading = false,
  loadingCount = 6,
}: OptimizedPostGridProps) {
  const config = LAYOUT_CONFIGS[layout]

  if (loading) {
    return (
      <div
        className={cn(
          config.containerClass,
          layout === 'grid' && config.getColumnsClass(columns),
          className
        )}
      >
        {[...Array(loadingCount)].map((_, i) => (
          <PostCardSkeleton key={i} variant={config.cardVariant} />
        ))}
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <EmptyState
        icon={layout === 'grid' ? Grid : FileText}
        title={emptyStateTitle}
        description={emptyStateDescription}
        className={className}
      />
    )
  }

  const renderPost = (post: PostWithExcerpt, index: number) => (
    <PostCard
      key={post.id}
      post={post}
      excerpt={post.excerpt}
      variant={config.cardVariant}
      showExcerpt={showExcerpts}
      showTags={showTags}
      showCategory={showCategories}
      maxTags={maxTags}
      priority={index === 0} // First post gets priority loading
    />
  )

  if (animate && layout === 'grid') {
    return (
      <StaggeredGrid
        cols={
          columns === 1 ? 1 : columns === 2 ? 2 : columns === 4 ? 4 : 'auto'
        }
        className={cn(className, config.containerClass)}
        staggerDelay={75}
        initialDelay={150}
      >
        {posts.map(renderPost)}
      </StaggeredGrid>
    )
  }

  if (animate && layout === 'list') {
    return (
      <StaggeredList
        className={cn(className, config.containerClass)}
        staggerDelay={75}
        initialDelay={150}
      >
        {posts.map(renderPost)}
      </StaggeredList>
    )
  }

  return (
    <div
      className={cn(
        config.containerClass,
        layout === 'grid' && config.getColumnsClass(columns),
        className
      )}
    >
      {posts.map(renderPost)}
    </div>
  )
}

// Specialized grid components for different use cases
export function FeaturedPostGrid({
  posts,
  className,
  ...props
}: Omit<OptimizedPostGridProps, 'layout'>) {
  return (
    <OptimizedPostGrid
      layout="featured"
      posts={posts}
      className={className}
      {...props}
    />
  )
}

export function CompactPostGrid({
  posts,
  className,
  ...props
}: Omit<OptimizedPostGridProps, 'layout'>) {
  return (
    <OptimizedPostGrid
      layout="compact"
      posts={posts}
      className={className}
      showExcerpts={false}
      maxTags={2}
      {...props}
    />
  )
}

export function PostListView({
  posts,
  className,
  ...props
}: Omit<OptimizedPostGridProps, 'layout'>) {
  return (
    <OptimizedPostGrid
      layout="list"
      posts={posts}
      className={className}
      {...props}
    />
  )
}
