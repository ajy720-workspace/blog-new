/**
 * Fallback image utilities for posts without cover images
 */

export const DEFAULT_FALLBACK_IMAGES = [
  '/images/fallback/abstract-1.jpg',
  '/images/fallback/abstract-2.jpg',
  '/images/fallback/abstract-3.jpg',
  '/images/fallback/abstract-4.jpg',
  '/images/fallback/abstract-5.jpg',
] as const

export const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  Technology: '/images/fallback/tech.jpg',
  Development: '/images/fallback/dev.jpg',
  Design: '/images/fallback/design.jpg',
  Business: '/images/fallback/business.jpg',
  Tutorial: '/images/fallback/tutorial.jpg',
  Review: '/images/fallback/review.jpg',
  News: '/images/fallback/news.jpg',
  Personal: '/images/fallback/personal.jpg',
}

/**
 * Generate a consistent fallback image based on post ID
 * Uses a simple hash function to ensure same post always gets same fallback
 */
export function getFallbackImage(postId: string, category?: string): string {
  // If category has a specific fallback, use it
  if (category && CATEGORY_FALLBACK_IMAGES[category]) {
    return CATEGORY_FALLBACK_IMAGES[category]
  }

  // Generate hash from post ID to ensure consistency
  let hash = 0
  for (let i = 0; i < postId.length; i++) {
    const char = postId.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }

  // Use absolute value and modulo to get array index
  const index = Math.abs(hash) % DEFAULT_FALLBACK_IMAGES.length
  return DEFAULT_FALLBACK_IMAGES[index]
}

/**
 * Generate a gradient fallback based on post title
 * For when we want purely CSS-based fallbacks
 */
export function getFallbackGradient(title: string, category?: string): string {
  const gradients = [
    'from-blue-500 to-purple-600',
    'from-green-500 to-teal-600',
    'from-pink-500 to-red-600',
    'from-yellow-500 to-orange-600',
    'from-indigo-500 to-blue-600',
    'from-purple-500 to-pink-600',
    'from-teal-500 to-green-600',
    'from-red-500 to-pink-600',
  ]

  const categoryGradients: Record<string, string> = {
    Technology: 'from-blue-500 to-cyan-600',
    Development: 'from-green-500 to-emerald-600',
    Design: 'from-pink-500 to-purple-600',
    Business: 'from-gray-500 to-slate-600',
    Tutorial: 'from-yellow-500 to-amber-600',
    Review: 'from-indigo-500 to-purple-600',
    News: 'from-red-500 to-orange-600',
    Personal: 'from-purple-500 to-pink-600',
  }

  if (category && categoryGradients[category]) {
    return categoryGradients[category]
  }

  // Generate hash from title
  let hash = 0
  for (let i = 0; i < title.length; i++) {
    const char = title.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }

  const index = Math.abs(hash) % gradients.length
  return gradients[index]
}

/**
 * Get the optimal image source for a post
 * Returns cover image if available, otherwise fallback
 */
export function getPostImageSrc(
  coverImage: string | undefined,
  postId: string,
  category?: string
): { src: string; isFallback: boolean } {
  if (coverImage) {
    return { src: coverImage, isFallback: false }
  }

  return {
    src: getFallbackImage(postId, category),
    isFallback: true,
  }
}
