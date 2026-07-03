'use server'

import { headers } from 'next/headers'

import { query, transaction } from '@/lib/db/client'
import { getClientIP, getUserAgent } from '@/lib/validation/validator'
import type {
  Like,
  LikeCountResult,
  LikeStatusResult,
  LikeSubmissionResult,
} from '@/types/likes'

const RATE_LIMIT_MAX_LIKES = 10
const RATE_LIMIT_WINDOW_MINUTES = 60

type LikeRow = Like

function toIso(value: string | Date): string {
  return value instanceof Date ? value.toISOString() : value
}

function mapLike(row: LikeRow): Like {
  return {
    ...row,
    user_id: row.user_id || undefined,
    anonymous_session_id: row.anonymous_session_id || undefined,
    anonymous_browser_id: row.anonymous_browser_id || undefined,
    ip_address: row.ip_address || undefined,
    user_agent: row.user_agent || undefined,
    created_at: toIso(row.created_at),
    updated_at: toIso(row.updated_at),
  }
}

export async function checkLikeRateLimit(ipAddress: string): Promise<boolean> {
  if (!ipAddress || ipAddress === 'unknown') {
    return true
  }

  try {
    const windowStart = new Date(
      Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000
    ).toISOString()
    const { rows } = await query<{ count: string }>(
      `SELECT COUNT(*)::text AS count
         FROM likes
        WHERE ip_address = $1::inet
          AND created_at >= $2`,
      [ipAddress, windowStart]
    )

    return Number(rows[0]?.count || 0) < RATE_LIMIT_MAX_LIKES
  } catch (error) {
    console.error('Rate limit check failed:', error)
    return true
  }
}

export async function getLikeCount(notionPageId: string): Promise<number> {
  try {
    const { rows } = await query<{ count: string }>(
      `SELECT COUNT(*)::text AS count
         FROM likes
        WHERE notion_page_id = $1`,
      [notionPageId]
    )

    return Number(rows[0]?.count || 0)
  } catch (error) {
    console.error('Error in getLikeCount:', error)
    return 0
  }
}

export async function getUserLikeStatus(
  notionPageId: string,
  userId?: string,
  anonymousSessionId?: string,
  anonymousBrowserId?: string
): Promise<LikeStatusResult> {
  try {
    if (!userId && !anonymousSessionId && !anonymousBrowserId) {
      return { isLiked: false }
    }

    const conditions = ['notion_page_id = $1']
    const params: unknown[] = [notionPageId]

    if (userId) {
      params.push(userId)
      conditions.push(`user_id = $${params.length}`)
    } else {
      const anonymousConditions = []

      if (anonymousSessionId) {
        params.push(anonymousSessionId)
        anonymousConditions.push(`anonymous_session_id = $${params.length}`)
      }

      if (anonymousBrowserId) {
        params.push(anonymousBrowserId)
        anonymousConditions.push(`anonymous_browser_id = $${params.length}`)
      }

      conditions.push(`(${anonymousConditions.join(' OR ')})`)
    }

    const { rows } = await query<{ id: string }>(
      `SELECT id FROM likes WHERE ${conditions.join(' AND ')} LIMIT 1`,
      params
    )

    return {
      isLiked: !!rows[0],
      likeId: rows[0]?.id,
    }
  } catch (error) {
    console.error('Error in getUserLikeStatus:', error)
    return { isLiked: false }
  }
}

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

export async function toggleLike(
  notionPageId: string,
  userId?: string,
  anonymousSessionId?: string,
  anonymousBrowserId?: string
): Promise<LikeSubmissionResult> {
  try {
    const headersList = await headers()
    const request = new Request('http://localhost', { headers: headersList })
    const ipAddress = getClientIP(request)
    const userAgent = getUserAgent(request)

    if (ipAddress && ipAddress !== 'unknown') {
      const isAllowed = await checkLikeRateLimit(ipAddress)
      if (!isAllowed) {
        return {
          success: false,
          error: 'Too many likes. Please wait before liking again.',
        }
      }
    }

    const currentStatus = await getUserLikeStatus(
      notionPageId,
      userId,
      anonymousSessionId,
      anonymousBrowserId
    )

    if (currentStatus.isLiked && currentStatus.likeId) {
      await query(`DELETE FROM likes WHERE id = $1`, [currentStatus.likeId])
      const newCount = await getLikeCount(notionPageId)
      return {
        success: true,
        isLiked: false,
        likeCount: newCount,
      }
    }

    const { rows } = await query<LikeRow>(
      `INSERT INTO likes (
         notion_page_id, user_id, anonymous_session_id, anonymous_browser_id,
         ip_address, user_agent, is_anonymous
       )
       VALUES ($1, $2, $3, $4, $5::inet, $6, $7)
       RETURNING id, notion_page_id, user_id, anonymous_session_id,
                 anonymous_browser_id, ip_address::text AS ip_address,
                 user_agent, is_anonymous, created_at, updated_at`,
      [
        notionPageId,
        userId || null,
        anonymousSessionId || null,
        anonymousBrowserId || null,
        ipAddress || null,
        userAgent,
        !userId,
      ]
    )

    const newCount = await getLikeCount(notionPageId)
    return {
      success: true,
      like: rows[0] ? mapLike(rows[0]) : undefined,
      isLiked: true,
      likeCount: newCount,
    }
  } catch (error) {
    console.error('Error in toggleLike:', error)
    return {
      success: false,
      error: 'An unexpected error occurred',
    }
  }
}

export async function transferAnonymousLikes(
  userId: string,
  anonymousSessionId?: string,
  anonymousBrowserId?: string
): Promise<{
  success: boolean
  transferredCount: number
  duplicatesRemoved?: number
  error?: string
}> {
  try {
    if (!anonymousSessionId && !anonymousBrowserId) {
      return { success: true, transferredCount: 0, duplicatesRemoved: 0 }
    }

    return transaction(async client => {
      const params: unknown[] = []
      const anonymousConditions = []

      if (anonymousSessionId) {
        params.push(anonymousSessionId)
        anonymousConditions.push(`anonymous_session_id = $${params.length}`)
      }

      if (anonymousBrowserId) {
        params.push(anonymousBrowserId)
        anonymousConditions.push(`anonymous_browser_id = $${params.length}`)
      }

      const { rows: anonymousLikes } = await client.query<{
        id: string
        notion_page_id: string
      }>(
        `SELECT id, notion_page_id
           FROM likes
          WHERE is_anonymous = true
            AND (${anonymousConditions.join(' OR ')})`,
        params
      )

      if (anonymousLikes.length === 0) {
        return { success: true, transferredCount: 0, duplicatesRemoved: 0 }
      }

      const pageIds = anonymousLikes.map(like => like.notion_page_id)
      const { rows: existingLikes } = await client.query<{
        notion_page_id: string
      }>(
        `SELECT notion_page_id
           FROM likes
          WHERE user_id = $1
            AND is_anonymous = false
            AND notion_page_id = ANY($2::varchar[])`,
        [userId, pageIds]
      )

      const existingPageIds = new Set(
        existingLikes.map(like => like.notion_page_id)
      )
      const duplicateIds = anonymousLikes
        .filter(like => existingPageIds.has(like.notion_page_id))
        .map(like => like.id)
      const transferableIds = anonymousLikes
        .filter(like => !existingPageIds.has(like.notion_page_id))
        .map(like => like.id)

      if (duplicateIds.length > 0) {
        await client.query(`DELETE FROM likes WHERE id = ANY($1::uuid[])`, [
          duplicateIds,
        ])
      }

      let transferredCount = 0
      if (transferableIds.length > 0) {
        const { rowCount } = await client.query(
          `UPDATE likes
              SET user_id = $1,
                  is_anonymous = false,
                  updated_at = NOW()
            WHERE id = ANY($2::uuid[])`,
          [userId, transferableIds]
        )
        transferredCount = rowCount || 0
      }

      return {
        success: true,
        transferredCount,
        duplicatesRemoved: duplicateIds.length,
      }
    })
  } catch (error) {
    console.error('Error in transferAnonymousLikes:', error)
    return { success: false, transferredCount: 0, duplicatesRemoved: 0 }
  }
}
