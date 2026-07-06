const DATABASE_UNAVAILABLE_TTL_MS = 30_000

let unavailableUntil = 0

export function isDatabaseMarkedUnavailable(): boolean {
  return Date.now() < unavailableUntil
}

export function markDatabaseUnavailable(error?: unknown): void {
  if (!error || isDatabaseUnavailableError(error)) {
    unavailableUntil = Date.now() + DATABASE_UNAVAILABLE_TTL_MS
  }
}

export function isDatabaseUnavailableError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false
  }

  const code = 'code' in error ? String(error.code) : undefined
  if (
    code &&
    [
      'ECONNREFUSED',
      'ENOTFOUND',
      'ETIMEDOUT',
      'ECONNRESET',
      'EHOSTUNREACH',
      'ENETUNREACH',
      '57P01',
      '57P03',
      '08000',
      '08003',
      '08006',
    ].includes(code)
  ) {
    return true
  }

  const message =
    error instanceof Error ? error.message.toLowerCase() : String(error)

  return (
    message.includes('database_url is not defined') ||
    message.includes('connect econnrefused') ||
    message.includes('connection terminated') ||
    message.includes('timeout expired') ||
    message.includes('terminating connection')
  )
}
