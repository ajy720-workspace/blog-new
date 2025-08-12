'use server'

import { headers } from 'next/headers'

import {
  checkRateLimit,
  createComment,
  getCommentCount as getCommentCountFromDB,
  getComments as getCommentsFromDB,
} from '@/lib/supabase/comments'
import {
  extractClientInfo,
  sanitizeCommentFormData,
  validateCommentForm,
} from '@/lib/supabase/validation'
import type {
  Comment,
  CommentFormData,
  CommentSubmissionResult,
} from '@/types/comments'

export async function submitComment(
  formData: CommentFormData,
  notionPageId: string
): Promise<CommentSubmissionResult> {
  try {
    // Extract client information from headers
    const headersList = await headers()
    const request = new Request('http://localhost', { headers: headersList })
    const { userAgent, ipAddress } = extractClientInfo(request)

    // Sanitize input data
    const sanitizedData = sanitizeCommentFormData(formData)

    // Validate form data
    const validationErrors = validateCommentForm(sanitizedData)
    if (validationErrors.length > 0) {
      return {
        success: false,
        error: validationErrors[0].message,
      }
    }

    // Check rate limiting if we have an IP address
    if (ipAddress) {
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
      sanitizedData,
      notionPageId,
      userAgent,
      ipAddress
    )

    return result
  } catch (error) {
    console.error('Error in submitComment action:', error)
    return {
      success: false,
      error: 'An unexpected error occurred while submitting your comment.',
    }
  }
}

export async function getComments(notionPageId: string): Promise<Comment[]> {
  try {
    return await getCommentsFromDB(notionPageId)
  } catch (error) {
    console.error('Error in getComments action:', error)
    return []
  }
}

export async function getCommentCount(notionPageId: string): Promise<number> {
  try {
    return await getCommentCountFromDB(notionPageId)
  } catch (error) {
    console.error('Error in getCommentCount action:', error)
    return 0
  }
}
