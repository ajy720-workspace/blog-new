import { securityConfig } from '@/config'
import type {
  Comment,
  CommentFormData,
  CommentSubmissionResult,
} from '@/types/comments'

import { getCurrentUserServer } from '@/lib/auth/session'
import { query } from '@/lib/db/client'

type CommentRow = Omit<Comment, 'profile'> & {
  profile_id?: string | null
  profile_display_name?: string | null
  profile_avatar_url?: string | null
  profile_provider?: string | null
  profile_created_at?: string | Date | null
  profile_updated_at?: string | Date | null
}

function toIso(value: string | Date): string {
  return value instanceof Date ? value.toISOString() : value
}

function mapComment(row: CommentRow): Comment {
  return {
    id: row.id,
    notion_page_id: row.notion_page_id,
    author_name: row.author_name,
    author_email: row.author_email || undefined,
    content: row.content,
    user_id: row.user_id || undefined,
    is_anonymous: row.is_anonymous,
    created_at: toIso(row.created_at),
    updated_at: toIso(row.updated_at),
    is_deleted: row.is_deleted,
    ip_address: row.ip_address || undefined,
    user_agent: row.user_agent || undefined,
    profile:
      row.profile_id && row.profile_display_name && row.profile_provider
        ? {
            id: row.profile_id,
            display_name: row.profile_display_name,
            avatar_url: row.profile_avatar_url || undefined,
            provider: row.profile_provider,
            created_at: row.profile_created_at
              ? toIso(row.profile_created_at)
              : new Date().toISOString(),
            updated_at: row.profile_updated_at
              ? toIso(row.profile_updated_at)
              : new Date().toISOString(),
          }
        : undefined,
  }
}

export async function getComments(notionPageId: string): Promise<Comment[]> {
  try {
    const { rows } = await query<CommentRow>(
      `SELECT * FROM get_comments_with_profiles($1)`,
      [notionPageId]
    )

    return rows.map(mapComment)
  } catch (error) {
    console.error('Error in getComments:', error)
    return []
  }
}

export async function getCommentCount(notionPageId: string): Promise<number> {
  try {
    const { rows } = await query<{ count: string }>(
      `SELECT COUNT(*)::text AS count
         FROM comments
        WHERE notion_page_id = $1
          AND is_deleted = false`,
      [notionPageId]
    )

    return Number(rows[0]?.count || 0)
  } catch (error) {
    console.error('Error in getCommentCount:', error)
    return 0
  }
}

export async function createComment(
  formData: CommentFormData,
  notionPageId: string,
  userAgent?: string,
  ipAddress?: string
): Promise<CommentSubmissionResult> {
  try {
    const user = await getCurrentUserServer()
    const { rows } = await query<CommentRow>(
      `INSERT INTO comments (
         notion_page_id, author_name, author_email, content, user_id,
         is_anonymous, ip_address, user_agent
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7::inet, $8)
       RETURNING id, notion_page_id, author_name, author_email, content,
                 user_id, is_anonymous, created_at, updated_at, is_deleted,
                 ip_address::text AS ip_address, user_agent`,
      [
        notionPageId,
        formData.authorName.trim(),
        formData.authorEmail?.trim() || null,
        formData.content.trim(),
        user?.id || null,
        !user || user.is_anonymous,
        ipAddress || null,
        userAgent || null,
      ]
    )

    return {
      success: true,
      comment: mapComment(rows[0]),
    }
  } catch (error) {
    console.error('Error in createComment:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

export async function checkRateLimit(ipAddress: string): Promise<boolean> {
  try {
    const oneHourAgo = new Date(
      Date.now() - securityConfig.rateLimit.comments.windowMs
    ).toISOString()
    const { rows } = await query<{ count: string }>(
      `SELECT COUNT(*)::text AS count
         FROM comments
        WHERE ip_address = $1::inet
          AND created_at >= $2`,
      [ipAddress, oneHourAgo]
    )

    return Number(rows[0]?.count || 0) < securityConfig.rateLimit.comments.maxPerHour
  } catch (error) {
    console.error('Error in checkRateLimit:', error)
    return true
  }
}

export async function softDeleteComment(
  commentId: string,
  userId?: string
): Promise<boolean> {
  try {
    const { rowCount } = await query(
      `UPDATE comments
          SET is_deleted = true
        WHERE id = $1
          AND user_id = $2`,
      [commentId, userId || null]
    )

    return (rowCount || 0) > 0
  } catch (error) {
    console.error('Error in softDeleteComment:', error)
    return false
  }
}

export async function transferAnonymousComments(
  currentAnonymousUserId: string,
  authenticatedUserId: string
): Promise<{ success: boolean; transferredCount: number }> {
  try {
    const { rowCount } = await query(
      `UPDATE comments
          SET user_id = $2,
              is_anonymous = false,
              updated_at = NOW()
        WHERE user_id = $1
          AND is_anonymous = true`,
      [currentAnonymousUserId, authenticatedUserId]
    )

    return { success: true, transferredCount: rowCount || 0 }
  } catch (error) {
    console.error('Error in transferAnonymousComments:', error)
    return { success: false, transferredCount: 0 }
  }
}
