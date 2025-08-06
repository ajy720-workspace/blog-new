/**
 * Unified slug generation utilities for consistent URL handling across the application
 */

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD') // Handle unicode characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^\w\s-]/g, '') // Remove special characters except word chars, spaces, and hyphens
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '') // Remove leading and trailing hyphens
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
  // Check if slug matches our expected format
  const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  return slugPattern.test(slug) && slug.length > 0 && slug.length <= 100
}

export function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
