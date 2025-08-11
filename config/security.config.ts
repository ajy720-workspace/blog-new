export interface SecurityConfig {
  rateLimit: {
    comments: {
      maxPerHour: number
      windowMs: number
    }
  }
  allowedHosts: string[]
  cors: {
    origins: string[]
    credentials: boolean
  }
  session: {
    cookieName: string
    maxAge: number // in seconds
    secure: boolean
    httpOnly: boolean
    sameSite: 'lax' | 'strict' | 'none'
  }
}

export const securityConfig: SecurityConfig = {
  rateLimit: {
    comments: {
      maxPerHour: 3,
      windowMs: 60 * 60 * 1000, // 1 hour in milliseconds
    },
  },

  allowedHosts: ['*.ajy720.me', 'localhost:3000'],

  cors: {
    origins: [
      'https://blog.ajy720.me',
      'https://ajy720.me',
      'http://localhost:3000',
    ],
    credentials: true,
  },

  session: {
    cookieName: 'session',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
  },
}
