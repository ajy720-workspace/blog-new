'use client'

import { useState, useCallback, useMemo } from 'react'
import { Search, Filter, X, Grid, List, Rows, ChevronDown } from 'lucide-react'
import { NotionPost, TagWithCount, CategoryWithCount } from '@/lib/core/notion'
import {
  SearchState,
  applyFilters,
  debounce,
  defaultSearchState,
  sortOptions,
  viewModeOptions,
  ViewMode,
  SortOption,
} from '@/lib/utils/search-utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

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
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          type="text"
          placeholder="Search posts, tags, categories..."
          value={searchState.query}
          onChange={e => handleSearchChange(e.target.value)}
          className="pl-10 pr-4"
        />
        {searchState.query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSearchChange('')}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Filter and View Controls */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          {/* Filter Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
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
              onClick={clearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              Clear all
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Sort Select */}
          <Select
            value={searchState.sortBy}
            onValueChange={(value: SortOption) =>
              updateSearchState({ sortBy: value })
            }
          >
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
          <div className="flex border rounded-md overflow-hidden">
            {viewModeOptions.map(mode => {
              const IconComponent =
                mode.icon === 'Grid' ? Grid : mode.icon === 'List' ? List : Rows
              return (
                <Button
                  key={mode.value}
                  variant={
                    searchState.viewMode === mode.value ? 'default' : 'ghost'
                  }
                  size="sm"
                  onClick={() => updateSearchState({ viewMode: mode.value })}
                  className="rounded-none border-0"
                >
                  <IconComponent className="w-4 h-4" />
                </Button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Expandable Filters */}
      {showFilters && (
        <div className="border rounded-lg p-4 space-y-4 bg-card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category Filters */}
            {categories.length > 0 && (
              <div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      Categories
                      {searchState.selectedCategories.length > 0 && (
                        <span className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {searchState.selectedCategories.length}
                        </span>
                      )}
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="start">
                    <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {categories.map(category => (
                      <DropdownMenuCheckboxItem
                        key={category.name}
                        checked={searchState.selectedCategories.includes(
                          category.name
                        )}
                        onCheckedChange={checked =>
                          handleCategoryToggle(category.name, checked)
                        }
                      >
                        <span className="flex items-center justify-between w-full">
                          <span>{category.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {category.count}
                          </span>
                        </span>
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {/* Tag Filters */}
            {tags.length > 0 && (
              <div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      Tags
                      {searchState.selectedTags.length > 0 && (
                        <span className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {searchState.selectedTags.length}
                        </span>
                      )}
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="start">
                    <DropdownMenuLabel>Filter by Tags</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {tags.slice(0, 20).map(tag => (
                      <DropdownMenuCheckboxItem
                        key={tag.name}
                        checked={searchState.selectedTags.includes(tag.name)}
                        onCheckedChange={checked =>
                          handleTagToggle(tag.name, checked)
                        }
                      >
                        <span className="flex items-center justify-between w-full">
                          <span>{tag.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {tag.count}
                          </span>
                        </span>
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {(searchState.selectedCategories.length > 0 ||
        searchState.selectedTags.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {/* Selected Categories */}
          {searchState.selectedCategories.map(category => (
            <span
              key={`cat-${category}`}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded-full"
            >
              📂 {category}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCategoryToggle(category, false)}
                className="h-auto p-0 w-4 h-4"
              >
                <X className="w-3 h-3" />
              </Button>
            </span>
          ))}

          {/* Selected Tags */}
          {searchState.selectedTags.map(tag => (
            <span
              key={`tag-${tag}`}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-primary/10 text-primary rounded-full"
            >
              🏷️ {tag}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTagToggle(tag, false)}
                className="h-auto p-0 w-4 h-4"
              >
                <X className="w-3 h-3" />
              </Button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
