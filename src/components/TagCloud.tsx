'use client'

import Link from 'next/link'

import { Tag } from 'lucide-react'

import { TagWithCount } from '@/lib/core/notion'
import { cn } from '@/lib/utils'

interface TagCloudProps {
  tags: TagWithCount[]
  maxTags?: number
  variant?: 'default' | 'compact' | 'colorful'
  className?: string
}

export function TagCloud({
  tags,
  maxTags = 20,
  variant = 'default',
  className = '',
}: TagCloudProps) {
  const displayTags = tags.slice(0, maxTags)
  const maxCount = Math.max(...displayTags.map(tag => tag.count))

  if (displayTags.length === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <Tag className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
        <p className="text-muted-foreground text-sm">No tags available</p>
      </div>
    )
  }

  const getTagSize = (count: number) => {
    const relativeSize = (count / maxCount) * 100

    if (variant === 'compact') {
      if (relativeSize > 70) return 'text-sm px-3 py-1.5'
      if (relativeSize > 40) return 'text-sm px-2.5 py-1'
      return 'text-xs px-2 py-1'
    }

    if (relativeSize > 80) return 'text-xl px-4 py-2'
    if (relativeSize > 60) return 'text-lg px-3 py-2'
    if (relativeSize > 40) return 'text-base px-3 py-1.5'
    if (relativeSize > 20) return 'text-sm px-2.5 py-1.5'
    return 'text-xs px-2 py-1'
  }

  const getTagColor = (index: number) => {
    if (variant !== 'colorful') return ''

    const colors = [
      'bg-blue-100 text-blue-700 hover:bg-blue-200',
      'bg-green-100 text-green-700 hover:bg-green-200',
      'bg-purple-100 text-purple-700 hover:bg-purple-200',
      'bg-pink-100 text-pink-700 hover:bg-pink-200',
      'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
      'bg-indigo-100 text-indigo-700 hover:bg-indigo-200',
      'bg-red-100 text-red-700 hover:bg-red-200',
      'bg-teal-100 text-teal-700 hover:bg-teal-200',
    ]

    return colors[index % colors.length]
  }

  if (variant === 'compact') {
    return (
      <div className={cn('space-y-3', className)}>
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Tag className="w-4 h-4" />
          Popular Tags
        </div>
        <div className="flex flex-wrap gap-2">
          {displayTags.map(tag => (
            <Link
              key={tag.slug}
              href={`/tag/${tag.slug}`}
              className={cn(
                'inline-flex items-center gap-1 rounded-full font-medium transition-all hover:scale-105',
                'bg-secondary hover:bg-secondary/80 text-secondary-foreground',
                getTagSize(tag.count)
              )}
            >
              {tag.name}
              <span className="opacity-60">({tag.count})</span>
            </Link>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Tag Cloud</h3>
        </div>
        {tags.length > maxTags && (
          <Link href="/tags" className="text-sm text-primary hover:underline">
            View all {tags.length} tags →
          </Link>
        )}
      </div>

      <div className="flex flex-wrap gap-3 justify-center">
        {displayTags.map((tag, index) => {
          const relativeSize = (tag.count / maxCount) * 100

          return (
            <Link
              key={tag.slug}
              href={`/tag/${tag.slug}`}
              className={cn(
                'inline-flex items-center gap-2 rounded-full font-medium transition-all duration-300 hover:scale-110 hover:shadow-md',
                variant === 'colorful'
                  ? getTagColor(index)
                  : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground',
                getTagSize(tag.count)
              )}
              style={{
                opacity: Math.max(0.6, relativeSize / 100),
                transform: `scale(${Math.max(0.85, relativeSize / 100)})`,
              }}
            >
              <Tag className="w-3 h-3" />
              {tag.name}
              <span className="text-xs opacity-70 bg-background/20 rounded-full px-1.5 py-0.5">
                {tag.count}
              </span>
            </Link>
          )
        })}
      </div>

      {tags.length > maxTags && (
        <div className="text-center pt-4">
          <Link
            href="/tags"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <Tag className="w-4 h-4" />
            Explore all {tags.length} tags
          </Link>
        </div>
      )}
    </div>
  )
}

// Interactive TagCloud with filtering
interface InteractiveTagCloudProps extends TagCloudProps {
  onTagSelect?: (tag: TagWithCount) => void
  selectedTags?: string[]
}

export function InteractiveTagCloud({
  tags,
  maxTags = 20,
  className = '',
  onTagSelect,
  selectedTags = [],
}: InteractiveTagCloudProps) {
  const displayTags = tags.slice(0, maxTags)
  const maxCount = Math.max(...displayTags.map(tag => tag.count))

  const handleTagClick = (tag: TagWithCount) => {
    if (onTagSelect) {
      onTagSelect(tag)
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-2">
        <Tag className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Filter by Tags</h3>
        {selectedTags.length > 0 && (
          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
            {selectedTags.length} selected
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {displayTags.map(tag => {
          const isSelected = selectedTags.includes(tag.slug)
          const relativeSize = (tag.count / maxCount) * 100

          return (
            <button
              key={tag.slug}
              onClick={() => handleTagClick(tag)}
              className={cn(
                'inline-flex items-center gap-2 rounded-full font-medium transition-all duration-300 hover:scale-105',
                isSelected
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground',
                relativeSize > 70
                  ? 'text-base px-4 py-2'
                  : relativeSize > 40
                    ? 'text-sm px-3 py-1.5'
                    : 'text-xs px-2 py-1'
              )}
            >
              <Tag className="w-3 h-3" />
              {tag.name}
              <span className="text-xs opacity-70 bg-background/20 rounded-full px-1.5 py-0.5">
                {tag.count}
              </span>
            </button>
          )
        })}
      </div>

      {selectedTags.length > 0 && (
        <div className="flex items-center gap-2 pt-2 border-t">
          <span className="text-xs text-muted-foreground">Selected:</span>
          {selectedTags.map(tagSlug => {
            const tag = tags.find(t => t.slug === tagSlug)
            if (!tag) return null

            return (
              <span
                key={tagSlug}
                className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
              >
                {tag.name}
                <button
                  onClick={() => handleTagClick(tag)}
                  className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                >
                  ×
                </button>
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}
