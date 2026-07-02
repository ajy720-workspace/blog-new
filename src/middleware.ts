import { NextRequest, NextResponse } from 'next/server'

import { securityConfig } from '@/config'
import { logSecurityEvent } from '@/lib/utils/error-handler'

import {
  getClientIP,
  getUserAgent,
  isValidOrigin,
} from './lib/validation/validator'

const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(
  ip: string,
  maxRequests: number = 100,
  windowMs: number = 60000
): boolean {
  const now = Date.now()
  const windowStart = now - windowMs

  // Clean up old entries
  for (const [key, value] of rateLimitMap.entries()) {
    if (value.resetTime < windowStart) {
      rateLimitMap.delete(key)
    }
  }

  const current = rateLimitMap.get(ip)

  if (!current) {
    rateLimitMap.set(ip, { count: 1, resetTime: now })
    return true
  }

  if (current.resetTime < windowStart) {
    rateLimitMap.set(ip, { count: 1, resetTime: now })
    return true
  }

  if (current.count >= maxRequests) {
    return false
  }

  current.count++
  return true
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ip = getClientIP(request)
  const userAgent = getUserAgent(request)
  const origin = request.headers.get('origin')

  // Security headers for all responses
  const response = NextResponse.next()

  if (pathname === '/api/health') {
    return response
  }

  // Rate limiting for API routes
  if (pathname.startsWith('/api/')) {
    if (!checkRateLimit(ip, 60, 60000)) {
      // 60 requests per minute
      logSecurityEvent(
        'rate_limit_exceeded',
        {
          endpoint: pathname,
          ip,
          userAgent,
        },
        ip,
        userAgent
      )

      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'Retry-After': '60',
        },
      })
    }
  }

  // Stricter rate limiting for sensitive endpoints
  if (
    pathname.includes('/api/webhook') ||
    pathname.includes('/api/revalidate')
  ) {
    if (!checkRateLimit(`${ip}:${pathname}`, 10, 60000)) {
      // 10 requests per minute for webhooks
      logSecurityEvent(
        'sensitive_endpoint_rate_limit',
        {
          endpoint: pathname,
          ip,
          userAgent,
        },
        ip,
        userAgent
      )

      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'Retry-After': '60',
        },
      })
    }
  }

  // CORS validation for API routes
  if (pathname.startsWith('/api/') && origin) {
    if (!isValidOrigin(origin, securityConfig.cors.origins)) {
      logSecurityEvent(
        'cors_violation',
        {
          endpoint: pathname,
          origin,
          ip,
        },
        ip,
        userAgent
      )

      return new NextResponse('Forbidden', { status: 403 })
    }
  }

  // Block suspicious user agents
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scanner/i,
    /curl/i,
    /wget/i,
    /python/i,
    /php/i,
    /java/i,
  ]

  // Allow legitimate crawlers for non-sensitive routes
  if (!pathname.startsWith('/api/') && !pathname.startsWith('/auth/')) {
    // Allow for public pages
  } else if (suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
    // Block bots from sensitive endpoints
    if (pathname.startsWith('/api/') || pathname.startsWith('/auth/')) {
      logSecurityEvent(
        'suspicious_user_agent_blocked',
        {
          endpoint: pathname,
          userAgent,
          ip,
        },
        ip,
        userAgent
      )

      return new NextResponse('Forbidden', { status: 403 })
    }
  }

  // Block requests with suspicious headers
  const suspiciousHeaders = [
    'x-forwarded-host',
    'x-originating-ip',
    'x-cluster-client-ip',
    'forwarded',
  ]

  for (const header of suspiciousHeaders) {
    const value = request.headers.get(header)
    if (value && pathname.startsWith('/api/')) {
      logSecurityEvent(
        'suspicious_header_detected',
        {
          endpoint: pathname,
          header,
          value: value.substring(0, 100), // Limit logged value length
          ip,
        },
        ip,
        userAgent
      )
    }
  }

  // Add security headers to response
  response.headers.set('X-Request-ID', crypto.randomUUID())
  response.headers.set('X-Robots-Tag', 'noindex, nofollow')

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
}
