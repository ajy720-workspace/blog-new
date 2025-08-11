/**
 * Unified slug generation utilities for consistent URL handling across the application
 */

export function slugify(text: string): string {
  const slug = text
    .toLowerCase()
    // .replace(/[^a-z0-9\s\uAC00-\uD7AF-]/gu, '') // Remove special characters except letters, numbers, spaces, hyphens, and Korean (Hangul)
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '') // Remove leading and trailing hyphens

  // Fallback for edge cases where slug becomes empty
  return slug || 'untitled'
}

export function generateSlug(title: string): string {
  return slugify(title)
}

export function createUniqueSlug(
  baseSlug: string,
  existingSlugs: string[]
): string {
  let uniqueSlug = baseSlug
  let counter = 1

  while (existingSlugs.includes(uniqueSlug)) {
    uniqueSlug = `${baseSlug}-${counter}`
    counter++
  }

  return uniqueSlug
}

export function isValidSlug(slug: string): boolean {
  // Check if slug matches our expected format (including Korean characters)
  const slugPattern = /^[a-z0-9\uAC00-\uD7AF]+(?:-[a-z0-9\uAC00-\uD7AF]+)*$/u
  return slugPattern.test(slug) && slug.length > 0 && slug.length <= 100
}

export function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
