'use server'

import { headers } from 'next/headers'
import { createComment, checkRateLimit } from '@/lib/supabase/comments'
import {
  validateCommentForm,
  sanitizeCommentFormData,
  extractClientInfo,
} from '@/lib/supabase/validation'
import type { CommentFormData, CommentSubmissionResult } from '@/types/comments'

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
