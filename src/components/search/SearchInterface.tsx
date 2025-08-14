'use client'

import { useCallback, useMemo, useState } from 'react'

import { CategoryWithCount, NotionPost, TagWithCount } from '@/lib/core/notion'
import { cn } from '@/lib/utils'
import {
  SearchState,
  SortOption,
  ViewMode,
  applyFilters,
  debounce,
  defaultSearchState,
} from '@/lib/utils/search-utils'

import { ActiveFilters } from './ActiveFilters'
import { FilterControls } from './FilterControls'
import { SearchBar } from './SearchBar'

interface SearchInterfaceProps {
  posts: NotionPost[]
  tags: TagWithCount[]
  categories: CategoryWithCount[]
  excerpts: Map<string, string>
  onResultsChange: (filteredPosts: NotionPost[]) => void
  onViewModeChange: (viewMode: ViewMode) => void
  className?: string
}

export function SearchInterface({
  posts,
  tags,
  categories,
  excerpts,
  onResultsChange,
  onViewModeChange,
  className,
}: SearchInterfaceProps) {
  const [searchState, setSearchState] =
    useState<SearchState>(defaultSearchState)
  const [showFilters, setShowFilters] = useState(false)

  // Create debounced search function
  const debouncedSearch = useMemo(() => {
    return debounce((newState: SearchState) => {
      const filteredPosts = applyFilters(posts, newState, excerpts)
      onResultsChange(filteredPosts)
    }, 300)
  }, [posts, excerpts, onResultsChange])

  // Handle search state updates
  const updateSearchState = useCallback(
    (updates: Partial<SearchState>) => {
      const newState = { ...searchState, ...updates }
      setSearchState(newState)

      // For immediate updates (like sorting and view mode)
      if (updates.sortBy || updates.viewMode) {
        const filteredPosts = applyFilters(posts, newState, excerpts)
        onResultsChange(filteredPosts)

        if (updates.viewMode) {
          onViewModeChange(updates.viewMode)
        }
      } else {
        // For search query, use debounced function
        debouncedSearch(newState)
      }
    },
    [
      searchState,
      posts,
      excerpts,
      onResultsChange,
      onViewModeChange,
      debouncedSearch,
    ]
  )

  // Handle search input
  const handleSearchChange = (query: string) => {
    updateSearchState({ query })
  }

  // Handle category filter toggle
  const handleCategoryToggle = (categoryName: string, checked: boolean) => {
    const selectedCategories = checked
      ? [...searchState.selectedCategories, categoryName]
      : searchState.selectedCategories.filter(c => c !== categoryName)

    updateSearchState({ selectedCategories })
  }

  // Handle tag filter toggle
  const handleTagToggle = (tagName: string, checked: boolean) => {
    const selectedTags = checked
      ? [...searchState.selectedTags, tagName]
      : searchState.selectedTags.filter(t => t !== tagName)

    updateSearchState({ selectedTags })
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchState(defaultSearchState)
    const filteredPosts = applyFilters(posts, defaultSearchState, excerpts)
    onResultsChange(filteredPosts)
    onViewModeChange(defaultSearchState.viewMode)
  }

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      searchState.query.trim() !== '' ||
      searchState.selectedCategories.length > 0 ||
      searchState.selectedTags.length > 0 ||
      searchState.sortBy !== defaultSearchState.sortBy
    )
  }, [searchState])

  // Get active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (searchState.query.trim()) count++
    if (searchState.selectedCategories.length > 0) count++
    if (searchState.selectedTags.length > 0) count++
    return count
  }, [searchState])

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search Bar */}
      <SearchBar
        value={searchState.query}
        onChange={handleSearchChange}
        placeholder="Search posts, tags, categories..."
      />

      {/* Filter and View Controls */}
      <FilterControls
        showFilters={showFilters}
        hasActiveFilters={hasActiveFilters}
        activeFiltersCount={activeFiltersCount}
        categories={categories}
        tags={tags}
        selectedCategories={searchState.selectedCategories}
        selectedTags={searchState.selectedTags}
        sortBy={searchState.sortBy}
        viewMode={searchState.viewMode}
        onShowFiltersToggle={() => setShowFilters(!showFilters)}
        onClearFilters={clearFilters}
        onCategoryToggle={handleCategoryToggle}
        onTagToggle={handleTagToggle}
        onSortChange={(sortBy: SortOption) => updateSearchState({ sortBy })}
        onViewModeChange={(viewMode: ViewMode) =>
          updateSearchState({ viewMode })
        }
      />

      {/* Active Filters Display */}
      <ActiveFilters
        selectedCategories={searchState.selectedCategories}
        selectedTags={searchState.selectedTags}
        onCategoryRemove={category => handleCategoryToggle(category, false)}
        onTagRemove={tag => handleTagToggle(tag, false)}
      />
    </div>
  )
}
