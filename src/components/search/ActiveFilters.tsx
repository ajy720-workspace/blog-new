'use client'

import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface ActiveFiltersProps {
  selectedCategories: string[]
  selectedTags: string[]
  onCategoryRemove: (category: string) => void
  onTagRemove: (tag: string) => void
  className?: string
}

export function ActiveFilters({
  selectedCategories,
  selectedTags,
  onCategoryRemove,
  onTagRemove,
  className = '',
}: ActiveFiltersProps) {
  const hasActiveFilters =
    selectedCategories.length > 0 || selectedTags.length > 0

  if (!hasActiveFilters) return null

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {/* Selected Categories */}
      {selectedCategories.map(category => (
        <span
          key={`cat-${category}`}
          className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded-full"
        >
          📂 {category}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCategoryRemove(category)}
            className="p-0 w-4 h-4"
          >
            <X className="w-3 h-3" />
          </Button>
        </span>
      ))}

      {/* Selected Tags */}
      {selectedTags.map(tag => (
        <span
          key={`tag-${tag}`}
          className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-primary/10 text-primary rounded-full"
        >
          🏷️ {tag}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onTagRemove(tag)}
            className="p-0 w-4 h-4"
          >
            <X className="w-3 h-3" />
          </Button>
        </span>
      ))}
    </div>
  )
}
