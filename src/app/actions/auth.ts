'use server'

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { getPublicOrigin } from '@/lib/utils/origin-detection'
import { securityConfig } from '@/config/security.config'
import { siteConfig } from '@/config/site.config'

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
    const supabase = await createClient()
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

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: redirectUrl,
      },
    })

    if (error) {
      console.error('GitHub OAuth sign in error:', error)
      return { success: false, error: error.message }
    }

    if (data.url) {
      // Redirect to GitHub OAuth - this will throw NEXT_REDIRECT internally, which is expected
      redirect(data.url)
    }

    return { success: false, error: 'No OAuth URL returned' }
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

export async function signOut(
  _prevState: AuthActionResult | null
): Promise<AuthActionResult> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Sign out error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Sign out error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function initAnonymousSession(
  _prevState: AuthActionResult | null
): Promise<AuthActionResult> {
  try {
    const supabase = await createClient()

    // Check if already has an active session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session?.user) {
      return { success: true }
    }

    // Sign in anonymously
    const { error } = await supabase.auth.signInAnonymously()

    if (error) {
      console.error('Anonymous sign in error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Anonymous session initialization error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
