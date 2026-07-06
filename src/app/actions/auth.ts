'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { securityConfig, siteConfig } from '@/config'
import { getGitHubOAuthUrl } from '@/lib/auth/github'
import {
  clearSession,
  ensureAnonymousSession,
  getUserProfileServer,
  isAnonymousUserServer,
} from '@/lib/auth/session'
import {
  isDatabaseMarkedUnavailable,
  isDatabaseUnavailableError,
  markDatabaseUnavailable,
} from '@/lib/db/availability'
import { getPublicOrigin } from '@/lib/utils/origin-detection'
import type { UserProfile } from '@/types/auth'

interface AuthActionResult {
  success: boolean
  error?: string
  redirectUrl?: string
}

export async function signInWithGitHub(
  _prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  try {
    const redirectTo = formData.get('redirectTo') as string | null

    // Get base URL from environment or headers
    const headersList = await headers()
    const origin = getPublicOrigin(headersList, undefined, {
      allowedHosts: securityConfig.allowedHosts,
      fallbackUrl: siteConfig.url,
    })

    const redirectUrl = `${origin}/auth/callback${
      redirectTo ? `?next=${encodeURIComponent(redirectTo)}` : ''
    }`
    const state = crypto.randomUUID()

    redirect(getGitHubOAuthUrl(redirectUrl, state))
  } catch (error) {
    // Check if this is the expected Next.js redirect error
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      // This is expected behavior in Next.js 15 - the redirect is working correctly
      throw error // Re-throw to let Next.js handle the redirect
    }

    console.error('GitHub OAuth error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function signOut(): Promise<AuthActionResult> {
  try {
    await clearSession()
    return { success: true }
  } catch (error) {
    console.error('Sign out error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function initAnonymousSession(): Promise<AuthActionResult> {
  if (isDatabaseMarkedUnavailable()) {
    return {
      success: false,
      error: 'Database is temporarily unavailable',
    }
  }

  try {
    await ensureAnonymousSession()
    return { success: true }
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      markDatabaseUnavailable(error)
    } else {
      console.error('Anonymous session initialization error:', error)
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function getUserProfile(): Promise<UserProfile | null> {
  if (isDatabaseMarkedUnavailable()) {
    return null
  }

  return getUserProfileServer()
}

export async function isAnonymousUser(): Promise<boolean> {
  if (isDatabaseMarkedUnavailable()) {
    return true
  }

  return isAnonymousUserServer()
}
