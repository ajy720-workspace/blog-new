export interface SafeError {
  message: string
  code?: string
  statusCode?: number
}

export interface ErrorDetails {
  userMessage: string
  logMessage: string
  statusCode: number
  code?: string
}

export class SecurityError extends Error {
  constructor(
    message: string,
    public statusCode: number = 403,
    public code?: string
  ) {
    super(message)
    this.name = 'SecurityError'
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
    public code?: string
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class RateLimitError extends Error {
  constructor(
    message: string = 'Too many requests',
    public statusCode: number = 429,
    public code?: string
  ) {
    super(message)
    this.name = 'RateLimitError'
  }
}

export function createSafeError(error: unknown): ErrorDetails {
  if (error instanceof SecurityError) {
    return {
      userMessage: 'Access denied',
      logMessage: `Security error: ${error.message}`,
      statusCode: error.statusCode,
      code: error.code,
    }
  }

  if (error instanceof ValidationError) {
    return {
      userMessage: error.message,
      logMessage: `Validation error: ${error.message}`,
      statusCode: error.statusCode,
      code: error.code,
    }
  }

  if (error instanceof RateLimitError) {
    return {
      userMessage: 'Too many requests. Please try again later.',
      logMessage: `Rate limit exceeded: ${error.message}`,
      statusCode: error.statusCode,
      code: error.code,
    }
  }

  if (error instanceof Error) {
    return {
      userMessage: 'An unexpected error occurred. Please try again later.',
      logMessage: `Unexpected error: ${error.message}`,
      statusCode: 500,
    }
  }

  return {
    userMessage: 'An unexpected error occurred. Please try again later.',
    logMessage: `Unknown error: ${String(error)}`,
    statusCode: 500,
  }
}

export function sanitizeErrorForLogging(error: unknown): string {
  if (error instanceof Error) {
    const sanitized = error.message
      .replace(/password[=:]\s*[^\s,}]+/gi, 'password=***')
      .replace(/token[=:]\s*[^\s,}]+/gi, 'token=***')
      .replace(/key[=:]\s*[^\s,}]+/gi, 'key=***')
      .replace(/secret[=:]\s*[^\s,}]+/gi, 'secret=***')

    return sanitized
  }

  return String(error)
}

export function logSecurityEvent(
  event: string,
  details: Record<string, unknown>,
  ip?: string,
  userAgent?: string
): void {
  // Import securityLogger dynamically to avoid circular imports
  import('@/lib/monitoring/security-logger')
    .then(({ securityLogger }) => {
      securityLogger.logSecurityEvent(event, details, 'warn', ip, userAgent)
    })
    .catch(() => {
      // Fallback to console logging if import fails
      const logEntry = {
        timestamp: new Date().toISOString(),
        event,
        ip: ip || 'unknown',
        userAgent: userAgent || 'unknown',
        details: sanitizeLogData(details),
      }

      console.warn('[SECURITY]', JSON.stringify(logEntry))
    })
}

function sanitizeLogData(
  data: Record<string, unknown>
): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      if (
        key.toLowerCase().includes('password') ||
        key.toLowerCase().includes('token') ||
        key.toLowerCase().includes('secret') ||
        key.toLowerCase().includes('key')
      ) {
        sanitized[key] = '***'
      } else {
        sanitized[key] = value
      }
    } else {
      sanitized[key] = value
    }
  }

  return sanitized
}
