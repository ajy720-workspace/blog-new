/**
 * 🔒 Security Configuration
 *
 * Security policies and protection settings for your blog.
 * Modify these settings carefully to maintain security.
 */
import type { SecurityConfig } from './types'

export const securityConfig: SecurityConfig = {
  // 🛡️ Rate Limiting
  rateLimit: {
    comments: {
      maxPerHour: 3, // Max comments per user per hour
      windowMs: 60 * 60 * 1000, // 1 hour window
    },
  },

  // 🌐 Allowed Hosts (supports wildcards)
  allowedHosts: [
    '*.ajy720.me', // Your domain
    'localhost:3000', // Local development
    // Add your domains here
  ],

  // 🔄 CORS Settings
  cors: {
    origins: [
      'https://blog.ajy720.me',
      'https://ajy720.me',
      'http://localhost:3000',
      // Add all your domains here
    ],
    credentials: true, // Allow cookies/auth
  },

  // 🍪 Session Settings
  session: {
    cookieName: 'session',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true, // Prevent JavaScript access
    sameSite: 'lax', // Balance security and compatibility
  },
}
