'use server'

import { headers } from 'next/headers'

import {
  checkRateLimit,
  createComment,
  getCommentCount as getCommentCountFromDB,
  getComments as getCommentsFromDB,
} from '@/lib/supabase/comments'
import { commentSchema } from '@/lib/validation/schemas'
import {
  getClientIP,
  getUserAgent,
  sanitizeInput,
  validateSchema,
} from '@/lib/validation/validator'
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
    console.error('Error in submitComment action:', error)
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again later.',
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
