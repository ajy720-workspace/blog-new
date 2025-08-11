'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Folder, ChevronRight, Grid, MoreHorizontal } from 'lucide-react'
import { CategoryWithCount } from '@/lib/core/notion'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { FadeIn } from '@/components/animations/FadeIn'

interface CategorySidebarProps {
  categories: CategoryWithCount[]
  currentCategory?: string
  className?: string
  compact?: boolean
  showCounts?: boolean
  maxVisible?: number
}

export function CategorySidebar({
  categories,
  currentCategory,
  className = '',
  compact = false,
  showCounts = true,
  maxVisible = 8,
}: CategorySidebarProps) {
  const [showAll, setShowAll] = useState(false)

  const visibleCategories = showAll
    ? categories
    : categories.slice(0, maxVisible)
  const hasMore = categories.length > maxVisible

  if (categories.length === 0) {
    return (
      <div className={cn('p-4 text-center', className)}>
        <Folder className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
        <p className="text-sm text-muted-foreground">No categories available</p>
      </div>
    )
  }

  return (
    <FadeIn className={cn('space-y-1', className)}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 px-2">
        <Grid className="w-4 h-4 text-primary" />
        <h3
          className={cn(
            'font-semibold text-foreground',
            compact ? 'text-sm' : 'text-base'
          )}
        >
          Categories
        </h3>
      </div>

      {/* Category List */}
      <nav className="space-y-0.5">
        {visibleCategories.map(category => {
          const isActive = currentCategory === category.slug

          return (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              className={cn(
                'group flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200',
                'hover:bg-secondary/80 hover:translate-x-1',
                isActive
                  ? 'bg-primary/10 text-primary border-l-2 border-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground',
                compact ? 'py-1.5 px-2 text-xs' : ''
              )}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Folder
                  className={cn(
                    'shrink-0 transition-colors',
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground/70 group-hover:text-muted-foreground',
                    compact ? 'w-3 h-3' : 'w-4 h-4'
                  )}
                />

                <span className="truncate">{category.name}</span>

                {isActive && (
                  <ChevronRight className="w-3 h-3 text-primary shrink-0" />
                )}
              </div>

              {showCounts && (
                <span
                  className={cn(
                    'shrink-0 rounded-full text-xs font-medium transition-colors',
                    isActive
                      ? 'bg-primary/20 text-primary px-2 py-0.5'
                      : 'bg-secondary text-secondary-foreground px-1.5 py-0.5 group-hover:bg-secondary/80',
                    compact ? 'text-xs px-1 py-0' : ''
                  )}
                >
                  {category.count}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Show More/Less Button */}
      {hasMore && (
        <div className="pt-2 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="w-full justify-start text-muted-foreground hover:text-foreground"
          >
            <MoreHorizontal className="w-4 h-4 mr-2" />
            {showAll
              ? 'Show less'
              : `Show ${categories.length - maxVisible} more`}
          </Button>
        </div>
      )}

      {/* All Categories Link */}
      <div className="pt-2 border-t border-border">
        <Link
          href="/categories"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
        >
          <Grid className="w-4 h-4" />
          View all categories
        </Link>
      </div>
    </FadeIn>
  )
}

// Horizontal category navigation for mobile/header
export function CategoryNavbar({
  categories,
  currentCategory,
  className = '',
  maxVisible = 5,
}: Omit<CategorySidebarProps, 'compact' | 'showCounts'>) {
  const [showAll, setShowAll] = useState(false)

  const visibleCategories = showAll
    ? categories
    : categories.slice(0, maxVisible)
  const hasMore = categories.length > maxVisible

  if (categories.length === 0) return null

  return (
    <div
      className={cn('flex items-center gap-2 overflow-x-auto pb-2', className)}
    >
      {visibleCategories.map(category => {
        const isActive = currentCategory === category.slug

        return (
          <Link
            key={category.slug}
            href={`/category/${category.slug}`}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            )}
          >
            <Folder className="w-3 h-3" />
            {category.name}
            <span className="text-xs opacity-75">({category.count})</span>
          </Link>
        )
      })}

      {hasMore && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAll(!showAll)}
          className="shrink-0"
        >
          {showAll ? 'Less' : `+${categories.length - maxVisible}`}
        </Button>
      )}
    </div>
  )
}
