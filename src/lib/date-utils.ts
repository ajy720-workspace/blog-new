/**
 * Date formatting utilities for consistent date display across the application
 */

export function formatPostDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatCompactDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInDays === 0) {
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    if (diffInHours === 0) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
      return `${diffInMinutes}m ago`
    }
    return `${diffInHours}h ago`
  } else if (diffInDays === 1) {
    return 'Yesterday'
  } else if (diffInDays < 7) {
    return `${diffInDays}d ago`
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7)
    return `${weeks}w ago`
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30)
    return `${months}mo ago`
  } else {
    const years = Math.floor(diffInDays / 365)
    return `${years}y ago`
  }
}

export function formatDateForSEO(dateString: string): string {
  return new Date(dateString).toISOString()
}

export function isDateRecent(
  dateString: string,
  daysThreshold: number = 7
): boolean {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  return diffInDays <= daysThreshold
}
