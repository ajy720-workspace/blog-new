import { NextRequest } from 'next/server'

import { z } from 'zod'

export interface ValidationResult<T> {
  success: boolean
  data?: T
  errors?: string[]
}

export function validateSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  try {
    const result = schema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.issues.map(err => err.message),
      }
    }
    return {
      success: false,
      errors: ['Validation failed'],
    }
  }
}

export function validateHeaders(
  request: NextRequest,
  requiredHeaders: string[]
): ValidationResult<Record<string, string>> {
  const headers: Record<string, string> = {}
  const errors: string[] = []

  for (const headerName of requiredHeaders) {
    const headerValue = request.headers.get(headerName)
    if (!headerValue) {
      errors.push(`Missing required header: ${headerName}`)
    } else {
      headers[headerName] = headerValue
    }
  }

  if (errors.length > 0) {
    return { success: false, errors }
  }

  return { success: true, data: headers }
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .substring(0, 2000)
}

export function isValidOrigin(
  origin: string,
  allowedOrigins: string[]
): boolean {
  if (!origin) return false

  return allowedOrigins.some(allowed => {
    if (allowed.includes('*')) {
      const pattern = allowed.replace(/\*/g, '.*')
      return new RegExp(`^${pattern}$`).test(origin)
    }
    return origin === allowed
  })
}

export function getClientIP(request: NextRequest | Request): string {
  const xForwardedFor = request.headers.get('x-forwarded-for')
  const xRealIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')

  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim()
  }

  if (xRealIP) {
    return xRealIP
  }

  if (cfConnectingIP) {
    return cfConnectingIP
  }

  // NextRequest has ip property, Request doesn't
  if ('ip' in request && request.ip) {
    return String(request.ip)
  }

  return 'unknown'
}

export function getUserAgent(request: NextRequest | Request): string {
  return request.headers.get('user-agent') || 'unknown'
}
