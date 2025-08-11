import { securityConfig } from '@/config/security.config'

interface OriginDetectionOptions {
  allowedHosts?: string[]
  fallbackUrl?: string
  enableDebugLogging?: boolean
}

interface OriginHeaders {
  get(name: string): string | null
}

/**
 * Detect the public origin from request headers in proxy environments
 * Prioritizes proxy headers over environment variables for better reliability
 */
export function getPublicOrigin(
  headers: OriginHeaders,
  requestUrl?: string,
  options: OriginDetectionOptions = {}
): string {
  const {
    allowedHosts = securityConfig.allowedHosts,
    fallbackUrl,
    enableDebugLogging = process.env.NODE_ENV === 'development',
  } = options

  // Extract header values
  const forwardedProto = headers.get('x-forwarded-proto')
  const forwardedHost = headers.get('x-forwarded-host')
  const host = headers.get('host')
  const origin = headers.get('origin')
  const referer = headers.get('referer')

  // Debug logging in development
  if (enableDebugLogging) {
    console.log('Origin detection headers:', {
      'x-forwarded-proto': forwardedProto,
      'x-forwarded-host': forwardedHost,
      host: host,
      origin: origin,
      'x-real-ip': headers.get('x-real-ip'),
      'x-forwarded-for': headers.get('x-forwarded-for'),
      referer: referer,
    })
  }

  // 1. Forwarded headers from reverse proxy (highest priority)
  if (forwardedProto && forwardedHost) {
    // Security: Validate against allowed hosts
    if (isHostAllowed(forwardedHost, allowedHosts)) {
      const detectedOrigin = `${forwardedProto}://${forwardedHost}`
      if (enableDebugLogging) {
        console.log(`✅ Using forwarded headers: ${detectedOrigin}`)
      }
      return detectedOrigin
    } else {
      console.warn(
        `🚨 Potentially malicious forwarded host rejected: ${forwardedHost}`
      )
    }
  }

  // 2. Environment variable as fallback
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    if (enableDebugLogging) {
      console.log(
        `✅ Using environment variable: ${process.env.NEXT_PUBLIC_SITE_URL}`
      )
    }
    return process.env.NEXT_PUBLIC_SITE_URL
  }

  // 3. Try to detect Docker container hostname pattern and use alternatives
  if (host && isDockerHostname(host)) {
    if (enableDebugLogging) {
      console.warn(`🐳 Detected Docker container hostname: ${host}`)
    }

    // Try referer as fallback (from OAuth redirect)
    if (referer) {
      try {
        const refererOrigin = new URL(referer).origin
        if (isHostAllowed(new URL(refererOrigin).hostname, allowedHosts)) {
          if (enableDebugLogging) {
            console.log(`✅ Using referer origin: ${refererOrigin}`)
          }
          return refererOrigin
        }
      } catch (error) {
        console.warn('Invalid referer URL:', referer)
      }
    }
  }

  // 4. Host header with protocol inference (only if not Docker hostname and allowed)
  if (host && !isDockerHostname(host) && isHostAllowed(host, allowedHosts)) {
    const protocol =
      forwardedProto || (host.includes('localhost') ? 'http' : 'https')
    const detectedOrigin = `${protocol}://${host}`
    if (enableDebugLogging) {
      console.log(`✅ Using host header: ${detectedOrigin}`)
    }
    return detectedOrigin
  }

  // 5. Custom fallback URL
  if (fallbackUrl) {
    if (enableDebugLogging) {
      console.log(`✅ Using custom fallback: ${fallbackUrl}`)
    }
    return fallbackUrl
  }

  // 6. Final fallback (may be incorrect in proxy environments)
  const finalFallback = requestUrl
    ? new URL(requestUrl).origin
    : 'http://localhost:3000'

  if (enableDebugLogging) {
    console.warn(`⚠️ Using final fallback (may be incorrect): ${finalFallback}`)
  }

  return finalFallback
}

/**
 * Check if hostname matches allowed hosts (supports wildcards and ports)
 */
function isHostAllowed(hostname: string, allowedHosts: string[]): boolean {
  // Remove port from hostname for comparison
  const hostWithoutPort = hostname.split(':')[0]
  console.log('hostWithoutPort:', hostWithoutPort)
  return allowedHosts.some(allowed => {
    console.log('allowed:', allowed)
    // Remove port from allowed host for comparison
    const allowedWithoutPort = allowed.split(':')[0]

    // Exact match
    if (hostname === allowed || hostWithoutPort === allowedWithoutPort) {
      return true
    }

    // Wildcard match (e.g., *.ajy720.me)
    if (allowed.startsWith('*.')) {
      const domain = allowed.slice(2)
      console.log('domain:', domain)
      return hostWithoutPort.endsWith(domain)
    }

    return false
  })
}

/**
 * Detect Docker container hostname patterns
 */
function isDockerHostname(hostname: string): boolean {
  // Docker container hostnames are typically 12+ character hex strings
  const dockerPattern = /^[a-f0-9]{12,}(:\d+)?$/
  return dockerPattern.test(hostname)
}
