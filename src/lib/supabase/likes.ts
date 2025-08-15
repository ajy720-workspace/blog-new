'use server'

import { headers } from 'next/headers'

import { createClient } from '@/lib/supabase/server'
import { getClientIP, getUserAgent } from '@/lib/validation/validator'
import type {
  Like,
  LikeCountResult,
  LikeStatusResult,
  LikeSubmissionResult,
} from '@/types/likes'

const RATE_LIMIT_MAX_LIKES = 10
const RATE_LIMIT_WINDOW_MINUTES = 60

/**
 * Check rate limiting for likes by IP address
 */
export async function checkLikeRateLimit(ipAddress: string): Promise<boolean> {
  if (!ipAddress || ipAddress === 'unknown') {
    return true
  }

  try {
    const supabase = await createClient()
    const windowStart = new Date(
      Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000
    )

    const { count } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('ip_address', ipAddress)
      .gte('created_at', windowStart.toISOString())

    return (count || 0) < RATE_LIMIT_MAX_LIKES
  } catch (error) {
    console.error('Rate limit check failed:', error)
    return true
  }
}

/**
 * Get like count for a post
 */
export async function getLikeCount(notionPageId: string): Promise<number> {
  try {
    const supabase = await createClient()

    const { count, error } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('notion_page_id', notionPageId)

    if (error) {
      console.error('Error getting like count:', error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error('Error in getLikeCount:', error)
    return 0
  }
}

/**
 * Check if user has liked a post
 */
export async function getUserLikeStatus(
  notionPageId: string,
  userId?: string,
  anonymousSessionId?: string,
  anonymousBrowserId?: string
): Promise<LikeStatusResult> {
  try {
    const supabase = await createClient()

    let query = supabase
      .from('likes')
      .select('id')
      .eq('notion_page_id', notionPageId)

    if (userId) {
      query = query.eq('user_id', userId)
    } else {
      // For anonymous users, check both session and browser ID
      if (anonymousSessionId && anonymousBrowserId) {
        query = query.or(
          `anonymous_session_id.eq.${anonymousSessionId},anonymous_browser_id.eq.${anonymousBrowserId}`
        )
      } else if (anonymousSessionId) {
        query = query.eq('anonymous_session_id', anonymousSessionId)
      } else if (anonymousBrowserId) {
        query = query.eq('anonymous_browser_id', anonymousBrowserId)
      } else {
        return { isLiked: false }
      }
    }

    const { data, error } = await query.single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking like status:', error)
      return { isLiked: false }
    }

    return {
      isLiked: !!data,
      likeId: data?.id,
    }
  } catch (error) {
    console.error('Error in getUserLikeStatus:', error)
    return { isLiked: false }
  }
}

/**
 * Get like count and user status in one call
 */
export async function getLikeCountAndStatus(
  notionPageId: string,
  userId?: string,
  anonymousSessionId?: string,
  anonymousBrowserId?: string
): Promise<LikeCountResult> {
  try {
    const [count, status] = await Promise.all([
      getLikeCount(notionPageId),
      getUserLikeStatus(
        notionPageId,
        userId,
        anonymousSessionId,
        anonymousBrowserId
      ),
    ])

    return {
      count,
      isLiked: status.isLiked,
    }
  } catch (error) {
    console.error('Error in getLikeCountAndStatus:', error)
    return { count: 0, isLiked: false }
  }
}

/**
 * Toggle like for a post
 */
export async function toggleLike(
  notionPageId: string,
  userId?: string,
  anonymousSessionId?: string,
  anonymousBrowserId?: string
): Promise<LikeSubmissionResult> {
  try {
    const supabase = await createClient()

    // Get request info
    const headersList = await headers()
    const request = new Request('http://localhost', { headers: headersList })
    const ipAddress = getClientIP(request)
    const userAgent = getUserAgent(request)

    // Rate limiting check
    if (ipAddress && ipAddress !== 'unknown') {
      const isAllowed = await checkLikeRateLimit(ipAddress)
      if (!isAllowed) {
        return {
          success: false,
          error: 'Too many likes. Please wait before liking again.',
        }
      }
    }

    // Check current like status
    const currentStatus = await getUserLikeStatus(
      notionPageId,
      userId,
      anonymousSessionId,
      anonymousBrowserId
    )

    if (currentStatus.isLiked && currentStatus.likeId) {
      // Remove like
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('id', currentStatus.likeId)

      if (error) {
        console.error('Error removing like:', error)
        return {
          success: false,
          error: 'Failed to remove like',
        }
      }

      const newCount = await getLikeCount(notionPageId)
      return {
        success: true,
        isLiked: false,
        likeCount: newCount,
      }
    } else {
      // Add like
      const likeData: Partial<Like> = {
        notion_page_id: notionPageId,
        user_id: userId,
        anonymous_session_id: anonymousSessionId,
        anonymous_browser_id: anonymousBrowserId,
        ip_address: ipAddress,
        user_agent: userAgent,
        is_anonymous: !userId,
      }

      const { data, error } = await supabase
        .from('likes')
        .insert(likeData)
        .select()
        .single()

      if (error) {
        console.error('Error adding like:', error)
        return {
          success: false,
          error: 'Failed to add like',
        }
      }

      const newCount = await getLikeCount(notionPageId)
      return {
        success: true,
        like: data,
        isLiked: true,
        likeCount: newCount,
      }
    }
  } catch (error) {
    console.error('Error in toggleLike:', error)
    return {
      success: false,
      error: 'An unexpected error occurred',
    }
  }
}

/**
 * Transfer anonymous likes to authenticated user
 */
export async function transferAnonymousLikes(
  userId: string,
  anonymousSessionId?: string,
  anonymousBrowserId?: string
): Promise<{ success: boolean; transferredCount: number }> {
  try {
    const supabase = await createClient()

    // Find anonymous likes to transfer
    let query = supabase
      .from('likes')
      .select('*')
      .eq('is_anonymous', true)
      .is('user_id', null)

    if (anonymousSessionId && anonymousBrowserId) {
      query = query.or(
        `anonymous_session_id.eq.${anonymousSessionId},anonymous_browser_id.eq.${anonymousBrowserId}`
      )
    } else if (anonymousSessionId) {
      query = query.eq('anonymous_session_id', anonymousSessionId)
    } else if (anonymousBrowserId) {
      query = query.eq('anonymous_browser_id', anonymousBrowserId)
    } else {
      return { success: true, transferredCount: 0 }
    }

    const { data: anonymousLikes, error: fetchError } = await query

    if (fetchError) {
      console.error('Error fetching anonymous likes:', fetchError)
      return { success: false, transferredCount: 0 }
    }

    if (!anonymousLikes || anonymousLikes.length === 0) {
      return { success: true, transferredCount: 0 }
    }

    // Check for existing likes by the user to avoid duplicates
    const { data: existingLikes } = await supabase
      .from('likes')
      .select('notion_page_id')
      .eq('user_id', userId)

    const existingPageIds = new Set(
      existingLikes?.map(like => like.notion_page_id) || []
    )

    // Filter out likes for posts the user has already liked
    const likesToTransfer = anonymousLikes.filter(
      like => !existingPageIds.has(like.notion_page_id)
    )

    if (likesToTransfer.length === 0) {
      // Delete duplicate anonymous likes
      await supabase
        .from('likes')
        .delete()
        .in(
          'id',
          anonymousLikes.map(like => like.id)
        )

      return { success: true, transferredCount: 0 }
    }

    // Update anonymous likes to be owned by the user
    const { error: updateError } = await supabase
      .from('likes')
      .update({
        user_id: userId,
        is_anonymous: false,
        updated_at: new Date().toISOString(),
      })
      .in(
        'id',
        likesToTransfer.map(like => like.id)
      )

    if (updateError) {
      console.error('Error transferring likes:', updateError)
      return { success: false, transferredCount: 0 }
    }

    // Delete remaining duplicate anonymous likes
    const duplicateIds = anonymousLikes
      .filter(like => !likesToTransfer.includes(like))
      .map(like => like.id)

    if (duplicateIds.length > 0) {
      await supabase.from('likes').delete().in('id', duplicateIds)
    }

    return { success: true, transferredCount: likesToTransfer.length }
  } catch (error) {
    console.error('Error in transferAnonymousLikes:', error)
    return { success: false, transferredCount: 0 }
  }
}
