'use client'

import { useMemo, useState } from 'react'

import { ArrowLeft, ArrowRight } from 'lucide-react'

import { FadeIn } from '@/components/animations'
import { OptimizedPostGrid } from '@/components/layout/OptimizedPostGrid'
import { SearchInterface } from '@/components/search'
import { CategoryWithCount, NotionPost, TagWithCount } from '@/lib/core/notion'
import { ViewMode } from '@/lib/utils/search-utils'

interface PostWithExcerpt extends NotionPost {
  excerpt: string
}

interface PostsContentProps {
  initialPosts: PostWithExcerpt[]
  tags: TagWithCount[]
  categories: CategoryWithCount[]
  excerpts: Map<string, string>
}

export function PostsContent({
  initialPosts,
  tags,
  categories,
  excerpts,
}: PostsContentProps) {
  const [filteredPosts, setFilteredPosts] = useState<NotionPost[]>(initialPosts)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [currentPage, setCurrentPage] = useState(1)

  const postsPerPage = 12

  // Memoize paginated posts
  const paginatedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * postsPerPage
    const endIndex = startIndex + postsPerPage
    return filteredPosts.slice(startIndex, endIndex)
  }, [filteredPosts, currentPage, postsPerPage])

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage)
  const hasNextPage = currentPage < totalPages
  const hasPrevPage = currentPage > 1

  // Handle search results change
  const handleResultsChange = (newPosts: NotionPost[]) => {
    setFilteredPosts(newPosts)
    setCurrentPage(1) // Reset to first page when results change
  }

  // Handle view mode change
  const handleViewModeChange = (newViewMode: ViewMode) => {
    setViewMode(newViewMode)
  }

  // Get posts with excerpts for display
  const postsWithExcerpts = useMemo(() => {
    return paginatedPosts.map(post => ({
      ...post,
      excerpt: excerpts.get(post.id) || '',
    }))
  }, [paginatedPosts, excerpts])

  return (
    <div className="space-y-8">
      {/* Search Interface */}
      <FadeIn delay={100}>
        <SearchInterface
          posts={initialPosts}
          tags={tags}
          categories={categories}
          excerpts={excerpts}
          onResultsChange={handleResultsChange}
          onViewModeChange={handleViewModeChange}
        />
      </FadeIn>

      {/* Results Summary */}
      <FadeIn delay={200}>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {filteredPosts.length === initialPosts.length
              ? `Showing all ${filteredPosts.length} posts`
              : `${filteredPosts.length} of ${initialPosts.length} posts`}
          </span>
          {totalPages > 1 && (
            <span>
              Page {currentPage} of {totalPages}
            </span>
          )}
        </div>
      </FadeIn>

      {/* Posts Grid */}
      <FadeIn delay={300}>
        <OptimizedPostGrid
          posts={postsWithExcerpts}
          layout={viewMode}
          columns={viewMode === 'grid' ? 3 : 1}
          animate={true}
          showExcerpts={true}
          showTags={true}
          showCategories={true}
          emptyStateTitle="No posts found"
          emptyStateDescription="Try adjusting your search terms or filters to find what you're looking for."
          className="min-h-[400px]"
        />
      </FadeIn>

      {/* Pagination */}
      {totalPages > 1 && (
        <FadeIn delay={400}>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={!hasPrevPage}
              className="p-2 text-sm border rounded-md hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number

                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 text-sm rounded-md transition-colors ${
                      currentPage === pageNum
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-secondary'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>

            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={!hasNextPage}
              className="p-2 text-sm border rounded-md hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </FadeIn>
      )}

      {/* Back to Top Button */}
      {filteredPosts.length > 6 && (
        <FadeIn delay={500}>
          <div className="text-center">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-4 py-2 text-sm bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
            >
              Back to top ↑
            </button>
          </div>
        </FadeIn>
      )}
    </div>
  )
}
