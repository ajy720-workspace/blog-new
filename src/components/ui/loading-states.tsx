import { cn } from '@/lib/utils'

import { LoadingSpinner } from './loading-spinner'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'rectangular' | 'circular' | 'avatar'
}

export function Skeleton({
  className,
  variant = 'rectangular',
}: SkeletonProps) {
  const variants = {
    text: 'h-4',
    rectangular: 'h-6',
    circular: 'rounded-full aspect-square',
    avatar: 'w-10 h-10 rounded-full',
  }

  return (
    <div
      className={cn(
        'animate-pulse bg-muted rounded',
        variants[variant],
        className
      )}
    />
  )
}

export function PostCardSkeleton({
  variant = 'default',
}: {
  variant?: 'default' | 'featured' | 'minimal' | 'compact'
}) {
  if (variant === 'minimal') {
    return (
      <div className="py-4 border-b border-border">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <Skeleton className="w-3/4 h-5" />
            <Skeleton className="w-full h-4" />
            <div className="flex gap-2">
              <Skeleton className="w-12 h-5 rounded-full" />
              <Skeleton className="w-16 h-5 rounded-full" />
            </div>
          </div>
          <Skeleton className="w-20 h-4" />
        </div>
      </div>
    )
  }

  if (variant === 'featured') {
    return (
      <div className="border-2 rounded-xl overflow-hidden animate-pulse">
        <Skeleton className="h-24 w-full" />
        <div className="p-6 space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="flex flex-wrap gap-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-16 rounded-full" />
            ))}
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className="flex gap-4 p-4 animate-pulse">
        <Skeleton className="w-24 h-16 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-16 rounded" />
          </div>
          <Skeleton className="h-4 w-full" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-16" />
            <div className="flex gap-1">
              <Skeleton className="h-5 w-12 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Default variant
  return (
    <div className="border rounded-lg overflow-hidden animate-pulse">
      <Skeleton className="h-1 w-full" />
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-5 w-20 rounded" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="flex flex-wrap gap-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-6 w-16 rounded-full" />
          ))}
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  )
}

export function TagCloudSkeleton({ maxTags = 12 }: { maxTags?: number }) {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center gap-2">
        <Skeleton className="w-5 h-5" />
        <Skeleton className="h-6 w-32" />
      </div>
      <div className="flex flex-wrap gap-3">
        {[...Array(maxTags)].map((_, i) => {
          const widths = ['w-12', 'w-16', 'w-20', 'w-24', 'w-14', 'w-18']
          return (
            <Skeleton
              key={i}
              className={cn('h-8 rounded-full', widths[i % widths.length])}
            />
          )
        })}
      </div>
    </div>
  )
}

export function CategorySidebarSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-8 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function CommentSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex gap-3">
        <Skeleton variant="avatar" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    </div>
  )
}

interface LoadingStateProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingState({
  message = 'Loading...',
  size = 'md',
  className,
}: LoadingStateProps) {
  const sizes = {
    sm: 'py-4',
    md: 'py-8',
    lg: 'py-12',
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        sizes[size],
        className
      )}
    >
      <LoadingSpinner
        className={cn(
          size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-10 h-10' : 'w-8 h-8'
        )}
      />
      <p
        className={cn(
          'text-muted-foreground mt-2',
          size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-base' : 'text-sm'
        )}
      >
        {message}
      </p>
    </div>
  )
}

export function PostGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-8">
      {/* Featured post skeleton */}
      <div className="mb-12">
        <PostCardSkeleton variant="featured" />
      </div>

      {/* Grid posts skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(count - 1)].map((_, i) => (
          <PostCardSkeleton key={i} variant="default" />
        ))}
      </div>
    </div>
  )
}

export function RelatedItemsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="mt-16 pt-8 border-t animate-pulse">
      <Skeleton className="h-8 w-48 mb-6" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(count)].map((_, i) => (
          <div key={i} className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <Skeleton className="h-5 w-24" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function PageHeaderSkeleton() {
  return (
    <div className="mb-12 animate-pulse">
      <Skeleton className="h-6 w-32 mb-6" />
      <div className="flex items-center gap-4 mb-4">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    </div>
  )
}

export function EmptyState({
  title,
  description,
  action,
  icon: Icon,
  className,
}: {
  title: string
  description?: string
  action?: React.ReactNode
  icon?: React.ComponentType<{ className?: string }>
  className?: string
}) {
  return (
    <div className={cn('text-center py-12', className)}>
      {Icon && (
        <Icon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
      )}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-muted-foreground mb-4 max-w-md mx-auto">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  )
}
