import { NotionPost } from '@/lib/core/notion'

export type SortOption = 'newest' | 'oldest' | 'title-asc' | 'title-desc'
export type ViewMode = 'grid' | 'list' | 'compact'

export interface SearchFilters {
  query: string
  selectedCategories: string[]
  selectedTags: string[]
  sortBy: SortOption
}

export interface SearchState extends SearchFilters {
  viewMode: ViewMode
  postsPerPage: number
}

// Search posts by title and content/excerpt
export function searchPosts(
  posts: NotionPost[],
  query: string,
  excerpts?: Map<string, string>
): NotionPost[] {
  if (!query.trim()) return posts

  const searchTerm = query.toLowerCase().trim()

  return posts.filter(post => {
    // Search in title
    const titleMatch = post.title.toLowerCase().includes(searchTerm)

    // Search in excerpt if available
    const excerpt = excerpts?.get(post.id) || ''
    const excerptMatch = excerpt.toLowerCase().includes(searchTerm)

    // Search in tags
    const tagMatch = post.tags.some(tag =>
      tag.toLowerCase().includes(searchTerm)
    )

    // Search in category
    const categoryMatch =
      post.category?.toLowerCase().includes(searchTerm) || false

    return titleMatch || excerptMatch || tagMatch || categoryMatch
  })
}

// Filter posts by categories
export function filterByCategories(
  posts: NotionPost[],
  selectedCategories: string[]
): NotionPost[] {
  if (selectedCategories.length === 0) return posts

  return posts.filter(
    post => post.category && selectedCategories.includes(post.category)
  )
}

// Filter posts by tags
export function filterByTags(
  posts: NotionPost[],
  selectedTags: string[]
): NotionPost[] {
  if (selectedTags.length === 0) return posts

  return posts.filter(post => post.tags.some(tag => selectedTags.includes(tag)))
}

// Sort posts based on selected option
export function sortPosts(
  posts: NotionPost[],
  sortBy: SortOption
): NotionPost[] {
  const sortedPosts = [...posts]

  switch (sortBy) {
    case 'newest':
      return sortedPosts.sort(
        (a, b) =>
          new Date(b.created_time).getTime() -
          new Date(a.created_time).getTime()
      )
    case 'oldest':
      return sortedPosts.sort(
        (a, b) =>
          new Date(a.created_time).getTime() -
          new Date(b.created_time).getTime()
      )
    case 'title-asc':
      return sortedPosts.sort((a, b) => a.title.localeCompare(b.title))
    case 'title-desc':
      return sortedPosts.sort((a, b) => b.title.localeCompare(a.title))
    default:
      return sortedPosts
  }
}

// Apply all filters and search to posts
export function applyFilters(
  posts: NotionPost[],
  filters: SearchFilters,
  excerpts?: Map<string, string>
): NotionPost[] {
  let filteredPosts = posts

  // Apply text search
  if (filters.query.trim()) {
    filteredPosts = searchPosts(filteredPosts, filters.query, excerpts)
  }

  // Apply category filters
  if (filters.selectedCategories.length > 0) {
    filteredPosts = filterByCategories(
      filteredPosts,
      filters.selectedCategories
    )
  }

  // Apply tag filters
  if (filters.selectedTags.length > 0) {
    filteredPosts = filterByTags(filteredPosts, filters.selectedTags)
  }

  // Apply sorting
  filteredPosts = sortPosts(filteredPosts, filters.sortBy)

  return filteredPosts
}

// Paginate posts
export function paginatePosts<T>(
  posts: T[],
  page: number,
  perPage: number
): { posts: T[]; totalPages: number; hasNext: boolean; hasPrev: boolean } {
  const totalPosts = posts.length
  const totalPages = Math.ceil(totalPosts / perPage)
  const startIndex = (page - 1) * perPage
  const endIndex = startIndex + perPage

  return {
    posts: posts.slice(startIndex, endIndex),
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  }
}

// Get search suggestions based on input
export function getSearchSuggestions(
  posts: NotionPost[],
  query: string,
  limit: number = 5
): string[] {
  if (!query.trim()) return []

  const searchTerm = query.toLowerCase()
  const suggestions = new Set<string>()

  posts.forEach(post => {
    // Add matching titles
    if (post.title.toLowerCase().includes(searchTerm)) {
      suggestions.add(post.title)
    }

    // Add matching tags
    post.tags.forEach(tag => {
      if (tag.toLowerCase().includes(searchTerm)) {
        suggestions.add(tag)
      }
    })

    // Add matching categories
    if (post.category && post.category.toLowerCase().includes(searchTerm)) {
      suggestions.add(post.category)
    }
  })

  return Array.from(suggestions).slice(0, limit)
}

// Debounce utility for search input
export function debounce<T extends (...args: never[]) => void>(
  func: T,
  delay: number
): T {
  let timeoutId: NodeJS.Timeout | null = null

  return ((...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      func(...args)
    }, delay)
  }) as T
}

// Default search state
export const defaultSearchState: SearchState = {
  query: '',
  selectedCategories: [],
  selectedTags: [],
  sortBy: 'newest',
  viewMode: 'grid',
  postsPerPage: 12,
}

// Get sort option labels
export const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'title-asc', label: 'Title (A-Z)' },
  { value: 'title-desc', label: 'Title (Z-A)' },
]

// Get view mode options
export const viewModeOptions: {
  value: ViewMode
  label: string
  icon: string
}[] = [
  { value: 'grid', label: 'Grid', icon: 'Grid' },
  { value: 'list', label: 'List', icon: 'List' },
  //{ value: 'compact', label: 'Compact', icon: 'Rows' },
]
