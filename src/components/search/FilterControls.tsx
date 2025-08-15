'use client'

import { Filter } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CategoryWithCount, TagWithCount } from '@/lib/core/notion'
import { cn } from '@/lib/utils'
import { SortOption, ViewMode, sortOptions } from '@/lib/utils/search-utils'

import { FilterDropdown } from './FilterDropdown'
import { ViewModeToggle } from './ViewModeToggle'

interface FilterControlsProps {
  // Filter state
  showFilters: boolean
  hasActiveFilters: boolean
  activeFiltersCount: number

  // Data
  categories: CategoryWithCount[]
  tags: TagWithCount[]

  // Filter values
  selectedCategories: string[]
  selectedTags: string[]
  sortBy: SortOption
  viewMode: ViewMode

  // Event handlers
  onShowFiltersToggle: () => void
  onClearFilters: () => void
  onCategoryToggle: (categoryName: string, checked: boolean) => void
  onTagToggle: (tagName: string, checked: boolean) => void
  onSortChange: (sortBy: SortOption) => void
  onViewModeChange: (viewMode: ViewMode) => void

  className?: string
}

export function FilterControls({
  showFilters,
  hasActiveFilters,
  activeFiltersCount,
  categories,
  tags,
  selectedCategories,
  selectedTags,
  sortBy,
  viewMode,
  onShowFiltersToggle,
  onClearFilters,
  onCategoryToggle,
  onTagToggle,
  onSortChange,
  onViewModeChange,
  className = '',
}: FilterControlsProps) {
  return (
    <div className={className}>
      {/* Filter and View Controls */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          {/* Filter Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={onShowFiltersToggle}
            className={cn(
              'flex items-center gap-2',
              hasActiveFilters && 'border-primary text-primary'
            )}
          >
            <Filter className="w-4 h-4" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </Button>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              Clear all
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Sort Select */}
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* View Mode Toggle */}
          <ViewModeToggle value={viewMode} onChange={onViewModeChange} />
        </div>
      </div>

      {/* Expandable Filters */}
      {showFilters && (
        <div className="border rounded-lg p-4 space-y-4 bg-card mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FilterDropdown
              label="Categories"
              items={categories}
              selectedItems={selectedCategories}
              onToggle={onCategoryToggle}
              searchPlaceholder="Search categories..."
              emptyMessage="No categories found"
              className={className}
            />
            <FilterDropdown
              label="Tags"
              items={tags}
              selectedItems={selectedTags}
              onToggle={onTagToggle}
              searchPlaceholder="Search tags..."
              emptyMessage="No tags found"
              className={className}
            />
          </div>
        </div>
      )}
    </div>
  )
}
