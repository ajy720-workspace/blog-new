'use server'

import { headers } from 'next/headers'

import {
  checkRateLimit,
  createComment,
  getCommentCount as getCommentCountFromDB,
  getComments as getCommentsFromDB,
} from '@/lib/db/comments'
import {
  isDatabaseMarkedUnavailable,
  isDatabaseUnavailableError,
  markDatabaseUnavailable,
} from '@/lib/db/availability'
import { commentSchema } from '@/lib/validation/schemas'
import {
  getClientIP,
  getUserAgent,
  sanitizeInput,
  validateSchema,
} from '@/lib/validation/validator'
import type {
  Comment,
  CommentCountResult,
  CommentFormData,
  CommentLoadResult,
  CommentSubmissionResult,
} from '@/types/comments'

const COMMENTS_DISABLED_MESSAGE =
  'Comments are temporarily unavailable because the database is not connected.'

export async function submitComment(
  formData: CommentFormData,
  notionPageId: string
): Promise<CommentSubmissionResult> {
  if (isDatabaseMarkedUnavailable()) {
    return {
      success: false,
      disabled: true,
      error: COMMENTS_DISABLED_MESSAGE,
    }
  }

  try {
    // Extract client information from headers
    const headersList = await headers()
    const request = new Request('http://localhost', { headers: headersList })
    const userAgent = getUserAgent(request)
    const ipAddress = getClientIP(request)

    // Sanitize input data
    const sanitizedData = {
      authorName: sanitizeInput(formData.authorName),
      authorEmail: formData.authorEmail
        ? sanitizeInput(formData.authorEmail)
        : '',
      content: sanitizeInput(formData.content),
    }

    // Validate form data with Zod schema
    const validation = validateSchema(commentSchema, sanitizedData)
    if (!validation.success) {
      return {
        success: false,
        error: validation.errors?.[0] || 'Invalid form data',
      }
    }

    // Check rate limiting if we have an IP address
    if (ipAddress && ipAddress !== 'unknown') {
      const isAllowed = await checkRateLimit(ipAddress)
      if (!isAllowed) {
        return {
          success: false,
          error:
            'Too many comments submitted. Please wait before posting again.',
        }
      }
    }

    // Create the comment
    const result = await createComment(
      validation.data!, // validation.success가 true이므로 data는 항상 존재
      notionPageId,
      userAgent,
      ipAddress
    )

    return result
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      markDatabaseUnavailable(error)
    } else {
      console.error('Error in submitComment action:', error)
    }

    return {
      success: false,
      disabled: true,
      error: isDatabaseUnavailableError(error)
        ? COMMENTS_DISABLED_MESSAGE
        : 'Comments are temporarily unavailable.',
    }
  }
}

export async function getCommentsState(
  notionPageId: string
): Promise<CommentLoadResult> {
  if (isDatabaseMarkedUnavailable()) {
    return {
      comments: [],
      disabled: true,
      error: COMMENTS_DISABLED_MESSAGE,
    }
  }

  try {
    return {
      comments: await getCommentsFromDB(notionPageId),
      disabled: false,
    }
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      markDatabaseUnavailable(error)
    } else {
      console.error('Error in getCommentsState action:', error)
    }

    return {
      comments: [],
      disabled: true,
      error: isDatabaseUnavailableError(error)
        ? COMMENTS_DISABLED_MESSAGE
        : 'Unable to load comments.',
    }
  }
}

export async function getComments(notionPageId: string): Promise<Comment[]> {
  if (isDatabaseMarkedUnavailable()) {
    return []
  }

  try {
    return await getCommentsFromDB(notionPageId)
  } catch (error) {
    console.error('Error in getComments action:', error)
    return []
  }
}

export async function getCommentCountState(
  notionPageId: string
): Promise<CommentCountResult> {
  if (isDatabaseMarkedUnavailable()) {
    return {
      count: 0,
      disabled: true,
      error: COMMENTS_DISABLED_MESSAGE,
    }
  }

  try {
    return {
      count: await getCommentCountFromDB(notionPageId),
      disabled: false,
    }
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      markDatabaseUnavailable(error)
    } else {
      console.error('Error in getCommentCountState action:', error)
    }

    return {
      count: 0,
      disabled: true,
      error: isDatabaseUnavailableError(error)
        ? COMMENTS_DISABLED_MESSAGE
        : 'Unable to load comment count.',
    }
  }
}

export async function getCommentCount(notionPageId: string): Promise<number> {
  if (isDatabaseMarkedUnavailable()) {
    return 0
  }

  try {
    return await getCommentCountFromDB(notionPageId)
  } catch (error) {
    console.error('Error in getCommentCount action:', error)
    return 0
  }
}

/**
 * Transfer anonymous comments to authenticated user (called after login)
 */
export async function transferUserComments(
  currentAnonymousUserId: string
): Promise<{ success: boolean; transferredCount: number }> {
  try {
    // Get user info - Server Action is responsible for authentication checks
    const { getUserProfileServer, isAnonymousUserServer } = await import(
      '@/lib/auth/session'
    )
    const userProfile = await getUserProfileServer()
    const isAnonymous = await isAnonymousUserServer()

    if (!userProfile || isAnonymous) {
      return { success: false, transferredCount: 0 }
    }

    // Transfer comments using database layer
    const { transferAnonymousComments } = await import(
      '@/lib/db/comments'
    )

    const result = await transferAnonymousComments(
      currentAnonymousUserId,
      userProfile.id
    )

    return result
  } catch (error) {
    console.error('Error in transferUserComments action:', error)
    return { success: false, transferredCount: 0 }
  }
}
