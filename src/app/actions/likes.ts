'use server'

import {
  getUserProfileServer,
  isAnonymousUserServer,
} from '@/lib/auth/session'
import {
  getLikeCountAndStatus,
  toggleLike as toggleLikeDB,
  transferAnonymousLikes,
} from '@/lib/db/likes'
import { likeSchema } from '@/lib/validation/schemas'
import { validateSchema } from '@/lib/validation/validator'
import type { LikeCountResult, LikeSubmissionResult } from '@/types/likes'

/**
 * Toggle like for a post
 */
export async function toggleLike(
  notionPageId: string,
  anonymousSessionId?: string,
  anonymousBrowserId?: string
): Promise<LikeSubmissionResult> {
  try {
    // Validate input
    const validation = validateSchema(likeSchema, {
      notionPageId,
      anonymousSessionId,
      anonymousBrowserId,
    })

    if (!validation.success) {
      return {
        success: false,
        error: validation.errors?.[0] || 'Invalid data',
      }
    }

    // Get user info
    const userProfile = await getUserProfileServer()
    const isAnonymous = await isAnonymousUserServer()

    const userId = userProfile && !isAnonymous ? userProfile.id : undefined

    // Toggle like
    const result = await toggleLikeDB(
      notionPageId,
      userId,
      anonymousSessionId,
      anonymousBrowserId
    )

    return result
  } catch (error) {
    console.error('Error in toggleLike action:', error)
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again later.',
    }
  }
}

/**
 * Get like count and user status for a post
 */
export async function getLikeCountAndUserStatus(
  notionPageId: string,
  anonymousSessionId?: string,
  anonymousBrowserId?: string
): Promise<LikeCountResult> {
  try {
    // Get user info
    const userProfile = await getUserProfileServer()
    const isAnonymous = await isAnonymousUserServer()

    const userId = userProfile && !isAnonymous ? userProfile.id : undefined

    // Get like count and status
    const result = await getLikeCountAndStatus(
      notionPageId,
      userId,
      anonymousSessionId,
      anonymousBrowserId
    )

    return result
  } catch (error) {
    console.error('Error in getLikeCountAndUserStatus action:', error)
    return { count: 0, isLiked: false }
  }
}

/**
 * Transfer anonymous likes to authenticated user (called after login)
 */
export async function transferUserLikes(
  anonymousSessionId?: string,
  anonymousBrowserId?: string
): Promise<{
  success: boolean
  transferredCount: number
  duplicatesRemoved?: number
  error?: string
}> {
  try {
    // Get user info
    const userProfile = await getUserProfileServer()
    const isAnonymous = await isAnonymousUserServer()

    if (!userProfile || isAnonymous) {
      return { success: false, transferredCount: 0, duplicatesRemoved: 0 }
    }

    // Transfer likes
    const result = await transferAnonymousLikes(
      userProfile.id,
      anonymousSessionId,
      anonymousBrowserId
    )

    return result
  } catch (error) {
    console.error('Error in transferUserLikes action:', error)
    return { success: false, transferredCount: 0, duplicatesRemoved: 0 }
  }
}
