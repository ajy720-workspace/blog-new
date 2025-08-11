import type { CommentFormData, CommentValidationError } from '@/types/comments'

export function validateCommentForm(
  formData: CommentFormData
): CommentValidationError[] {
  const errors: CommentValidationError[] = []

  // Validate author name
  const authorName = formData.authorName?.trim()
  if (!authorName) {
    errors.push({
      field: 'authorName',
      message: 'Name is required',
    })
  } else if (authorName.length < 1) {
    errors.push({
      field: 'authorName',
      message: 'Name must be at least 1 character',
    })
  } else if (authorName.length > 100) {
    errors.push({
      field: 'authorName',
      message: 'Name cannot exceed 100 characters',
    })
  } else if (hasInvalidNameCharacters(authorName)) {
    errors.push({
      field: 'authorName',
      message: 'Name contains invalid characters',
    })
  }

  // Validate content
  const content = formData.content?.trim()
  if (!content) {
    errors.push({
      field: 'content',
      message: 'Comment content is required',
    })
  } else if (content.length < 1) {
    errors.push({
      field: 'content',
      message: 'Comment must be at least 1 character',
    })
  } else if (content.length > 2000) {
    errors.push({
      field: 'content',
      message: 'Comment cannot exceed 2000 characters',
    })
  }

  // Validate email (optional)
  if (formData.authorEmail && formData.authorEmail.trim()) {
    const email = formData.authorEmail.trim()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      errors.push({
        field: 'authorEmail',
        message: 'Please enter a valid email address',
      })
    } else if (email.length > 255) {
      errors.push({
        field: 'authorEmail',
        message: 'Email cannot exceed 255 characters',
      })
    }
  }

  return errors
}

function hasInvalidNameCharacters(name: string): boolean {
  // Blacklist approach - block dangerous characters only
  const dangerousChars = /[<>'"&]/ // HTML/JS injection risks
  const controlChars = /[\u0000-\u001F\u007F-\u009F]/ // Control characters
  const zeroWidthChars = /[\u200B-\u200F\u2060\uFEFF]/ // Zero-width chars

  return (
    dangerousChars.test(name) ||
    controlChars.test(name) ||
    zeroWidthChars.test(name)
  )
}

export function sanitizeInput(input: string): string {
  if (!input) return ''

  return (
    input
      .trim()
      // Remove potential XSS patterns
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      .trim()
  )
}

export function sanitizeCommentFormData(
  formData: CommentFormData
): CommentFormData {
  return {
    authorName: sanitizeInput(formData.authorName),
    content: sanitizeInput(formData.content),
    authorEmail: formData.authorEmail
      ? sanitizeInput(formData.authorEmail)
      : undefined,
  }
}

export function isValidNotionPageId(pageId: string): boolean {
  // Notion page IDs are typically 32-character hex strings with optional hyphens
  const cleanId = pageId.replace(/-/g, '')
  return /^[a-f0-9]{32}$/i.test(cleanId)
}

export function extractClientInfo(request: Request) {
  const userAgent = request.headers.get('user-agent') || undefined
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')

  // Get IP address from various headers (for proxies/CDNs)
  let ipAddress: string | undefined
  if (forwardedFor) {
    ipAddress = forwardedFor.split(',')[0].trim()
  } else if (realIp) {
    ipAddress = realIp.trim()
  }

  return { userAgent, ipAddress }
}
