import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utility functions re-exports for convenient importing
 */

// Date utilities
export * from './date-utils'

// Slug utilities
export * from './slug-utils'

// Search utilities
export * from './search-utils'

// Origin detection utilities
export * from './origin-detection'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
