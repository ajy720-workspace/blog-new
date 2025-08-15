'use client'

/**
 * Utility functions for managing anonymous user identification
 */

const ANONYMOUS_BROWSER_ID_KEY = 'anonymous_browser_id'

/**
 * Get or create anonymous browser ID from localStorage
 */
export function getAnonymousBrowserId(): string {
  if (typeof window === 'undefined') {
    return ''
  }

  try {
    let browserId = localStorage.getItem(ANONYMOUS_BROWSER_ID_KEY)

    if (!browserId) {
      browserId = crypto.randomUUID()
      localStorage.setItem(ANONYMOUS_BROWSER_ID_KEY, browserId)
    }

    return browserId
  } catch (error) {
    console.error('Failed to get/set anonymous browser ID:', error)
    return crypto.randomUUID()
  }
}

/**
 * Clear anonymous browser ID (useful for testing or user logout)
 */
export function clearAnonymousBrowserId(): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.removeItem(ANONYMOUS_BROWSER_ID_KEY)
  } catch (error) {
    console.error('Failed to clear anonymous browser ID:', error)
  }
}

/**
 * Check if anonymous browser ID exists
 */
export function hasAnonymousBrowserId(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  try {
    return localStorage.getItem(ANONYMOUS_BROWSER_ID_KEY) !== null
  } catch {
    return false
  }
}
