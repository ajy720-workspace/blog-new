interface SecurityLog {
  timestamp: string
  level: 'info' | 'warn' | 'error' | 'critical'
  event: string
  ip?: string
  userAgent?: string
  userId?: string
  sessionId?: string
  details: Record<string, unknown>
}

interface AuthEvent {
  type:
    | 'login_success'
    | 'login_failure'
    | 'logout'
    | 'token_refresh'
    | 'password_change'
  userId?: string
  provider?: string
  ip?: string
  userAgent?: string
}

interface AccessEvent {
  type:
    | 'unauthorized_access'
    | 'forbidden_resource'
    | 'rate_limit_exceeded'
    | 'suspicious_activity'
  resource: string
  ip?: string
  userAgent?: string
  reason?: string
}

interface DataEvent {
  type: 'data_access' | 'data_modification' | 'data_deletion' | 'export_request'
  resource: string
  userId?: string
  ip?: string
  details?: Record<string, unknown>
}

class SecurityLogger {
  private logs: SecurityLog[] = []
  private maxLogs = 10000 // Keep last 10k logs in memory

  private createLog(
    level: SecurityLog['level'],
    event: string,
    details: Record<string, unknown>,
    ip?: string,
    userAgent?: string,
    userId?: string,
    sessionId?: string
  ): SecurityLog {
    return {
      timestamp: new Date().toISOString(),
      level,
      event,
      ip: ip || 'unknown',
      userAgent: userAgent || 'unknown',
      userId,
      sessionId,
      details: this.sanitizeDetails(details),
    }
  }

  private sanitizeDetails(
    details: Record<string, unknown>
  ): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(details)) {
      if (typeof value === 'string') {
        const lowerKey = key.toLowerCase()
        if (
          lowerKey.includes('password') ||
          lowerKey.includes('token') ||
          lowerKey.includes('secret') ||
          lowerKey.includes('key') ||
          lowerKey.includes('authorization')
        ) {
          sanitized[key] = '***'
        } else if (lowerKey.includes('email') && typeof value === 'string') {
          // Partially hide email
          const emailParts = value.split('@')
          if (emailParts.length === 2) {
            const username = emailParts[0]
            const domain = emailParts[1]
            sanitized[key] = `${username.charAt(0)}***@${domain}`
          } else {
            sanitized[key] = value
          }
        } else {
          sanitized[key] = value
        }
      } else {
        sanitized[key] = value
      }
    }

    return sanitized
  }

  private addLog(log: SecurityLog): void {
    this.logs.push(log)

    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }

    // Always log to console with appropriate level
    const logMessage = `[SECURITY] ${log.event}: ${JSON.stringify({
      timestamp: log.timestamp,
      ip: log.ip,
      userAgent: log.userAgent,
      details: log.details,
    })}`

    switch (log.level) {
      case 'critical':
      case 'error':
        console.error(logMessage)
        break
      case 'warn':
        console.warn(logMessage)
        break
      case 'info':
      default:
        console.info(logMessage)
        break
    }
  }

  // Authentication events
  logAuthEvent(event: AuthEvent): void {
    const log = this.createLog(
      event.type.includes('failure') ? 'warn' : 'info',
      `auth_${event.type}`,
      {
        type: event.type,
        provider: event.provider,
        userId: event.userId,
      },
      event.ip,
      event.userAgent,
      event.userId
    )
    this.addLog(log)
  }

  // Access control events
  logAccessEvent(event: AccessEvent): void {
    const log = this.createLog(
      'warn',
      `access_${event.type}`,
      {
        type: event.type,
        resource: event.resource,
        reason: event.reason,
      },
      event.ip,
      event.userAgent
    )
    this.addLog(log)
  }

  // Data access events
  logDataEvent(event: DataEvent): void {
    const level = event.type.includes('deletion') ? 'warn' : 'info'
    const log = this.createLog(
      level,
      `data_${event.type}`,
      {
        type: event.type,
        resource: event.resource,
        ...event.details,
      },
      event.ip,
      undefined,
      event.userId
    )
    this.addLog(log)
  }

  // Generic security event
  logSecurityEvent(
    event: string,
    details: Record<string, unknown>,
    level: SecurityLog['level'] = 'warn',
    ip?: string,
    userAgent?: string,
    userId?: string
  ): void {
    const log = this.createLog(level, event, details, ip, userAgent, userId)
    this.addLog(log)
  }

  // Get recent logs for monitoring
  getRecentLogs(limit: number = 100): SecurityLog[] {
    return this.logs.slice(-limit)
  }

  // Get logs by event type
  getLogsByEvent(event: string, limit: number = 50): SecurityLog[] {
    return this.logs.filter(log => log.event === event).slice(-limit)
  }

  // Get logs by IP
  getLogsByIP(ip: string, limit: number = 50): SecurityLog[] {
    return this.logs.filter(log => log.ip === ip).slice(-limit)
  }

  // Get critical/error logs
  getCriticalLogs(limit: number = 50): SecurityLog[] {
    return this.logs
      .filter(log => log.level === 'critical' || log.level === 'error')
      .slice(-limit)
  }

  // Clear logs (for testing or maintenance)
  clearLogs(): void {
    this.logs = []
  }

  // Export logs for external analysis
  exportLogs(startDate?: Date, endDate?: Date): SecurityLog[] {
    let filtered = this.logs

    if (startDate) {
      filtered = filtered.filter(log => new Date(log.timestamp) >= startDate)
    }

    if (endDate) {
      filtered = filtered.filter(log => new Date(log.timestamp) <= endDate)
    }

    return filtered
  }
}

// Singleton instance
const securityLogger = new SecurityLogger()

export {
  securityLogger,
  type SecurityLog,
  type AuthEvent,
  type AccessEvent,
  type DataEvent,
}
// export default securityLogger
