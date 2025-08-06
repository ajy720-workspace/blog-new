/**
 * Component utilities for consistent UI patterns across the application
 */

// Component utilities for consistent UI patterns

export interface TagItem {
  name: string
  slug?: string
  count?: number
}

export interface TagDisplayOptions {
  maxTags?: number
  showCount?: boolean
  variant?: 'default' | 'compact' | 'colorful'
  linkPath?: string // e.g., '/tag' for tag links
  className?: string
}

export function getTagClasses(
  variant: 'default' | 'compact' | 'colorful' = 'default'
) {
  const baseClasses = {
    default:
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors',
    compact:
      'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary/50 text-secondary-foreground',
    colorful:
      'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
  }

  return baseClasses[variant]
}

export function getColorfulTagClass(index: number): string {
  const colorfulClasses = [
    'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300',
    'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300',
    'bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300',
    'bg-pink-100 text-pink-700 hover:bg-pink-200 dark:bg-pink-900/30 dark:text-pink-300',
    'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300',
    'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300',
    'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300',
    'bg-teal-100 text-teal-700 hover:bg-teal-200 dark:bg-teal-900/30 dark:text-teal-300',
  ]

  return colorfulClasses[index % colorfulClasses.length]
}

export function getCardVariantClasses(
  variant: 'default' | 'minimal' | 'featured' | 'compact'
) {
  const variants = {
    default: {
      container:
        'group bg-card border rounded-lg overflow-hidden hover:shadow-lg hover:border-primary/50 transition-all duration-300',
      content: 'p-6 space-y-4',
      title:
        'text-xl font-bold group-hover:text-primary transition-colors line-clamp-2',
      excerpt: 'text-muted-foreground line-clamp-3 leading-relaxed',
    },
    minimal: {
      container: 'group py-4 border-b border-border last:border-b-0',
      content: 'space-y-2',
      title:
        'font-semibold group-hover:text-primary transition-colors line-clamp-2',
      excerpt: 'text-sm text-muted-foreground line-clamp-2',
    },
    featured: {
      container:
        'group relative overflow-hidden rounded-xl border-2 border-border hover:border-primary/50 transition-all duration-300 bg-card',
      content: 'p-6 space-y-4',
      title:
        'text-2xl font-bold group-hover:text-primary transition-colors line-clamp-2',
      excerpt: 'text-muted-foreground line-clamp-3 leading-relaxed',
    },
    compact: {
      container:
        'group flex gap-4 p-4 rounded-lg hover:bg-secondary/50 transition-colors',
      content: 'flex-1 space-y-2',
      title:
        'font-semibold group-hover:text-primary transition-colors line-clamp-2',
      excerpt: 'text-sm text-muted-foreground line-clamp-2',
    },
  }

  return variants[variant]
}

export function truncateText(text: string, maxLength: number = 150): string {
  if (text.length <= maxLength) return text

  const truncated = text.substring(0, maxLength)
  const lastSpaceIndex = truncated.lastIndexOf(' ')

  return lastSpaceIndex > maxLength * 0.7
    ? truncated.substring(0, lastSpaceIndex) + '...'
    : truncated + '...'
}
