import { BreadcrumbNav } from '@/components/SEO/BreadcrumbNav'
import { PostCardSkeleton } from '@/components/ui/loading-states'

export default function PostsLoading() {
  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'All Posts', url: '/posts' },
  ]

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Breadcrumb Navigation */}
      <BreadcrumbNav items={breadcrumbItems} className="mb-6" />

      {/* Page Header */}
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4">All Posts</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover and explore all blog posts. Use the search and filters below
          to find exactly what you&apos;re looking for.
        </p>
      </header>

      <div className="space-y-8">
        {/* Search Interface Skeleton */}
        <div className="space-y-4">
          <div className="h-10 bg-muted rounded-md animate-pulse" />
          <div className="flex flex-col sm:flex-row gap-4 sm:justify-between">
            <div className="flex gap-2">
              <div className="h-8 w-20 bg-muted rounded animate-pulse" />
              <div className="h-8 w-16 bg-muted rounded animate-pulse" />
            </div>
            <div className="flex gap-2">
              <div className="h-8 w-32 bg-muted rounded animate-pulse" />
              <div className="h-8 w-24 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>

        {/* Results Summary Skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-4 w-32 bg-muted rounded animate-pulse" />
          <div className="h-4 w-24 bg-muted rounded animate-pulse" />
        </div>

        {/* Posts Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(9)].map((_, i) => (
            <PostCardSkeleton key={i} variant="default" />
          ))}
        </div>

        {/* Pagination Skeleton */}
        <div className="flex items-center justify-center gap-2">
          <div className="h-9 w-20 bg-muted rounded-md animate-pulse" />
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-9 w-9 bg-muted rounded-md animate-pulse"
              />
            ))}
          </div>
          <div className="h-9 w-16 bg-muted rounded-md animate-pulse" />
        </div>
      </div>
    </main>
  )
}
