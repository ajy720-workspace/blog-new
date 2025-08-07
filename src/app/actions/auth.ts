'use server'

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

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
    const baseUrl = await getBaseUrl()

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${baseUrl}/auth/callback${
          redirectTo ? `?next=${encodeURIComponent(redirectTo)}` : ''
        }`,
      },
    })

    if (error) {
      console.error('GitHub OAuth sign in error:', error)
      return { success: false, error: error.message }
    }

    if (data.url) {
      // Redirect to GitHub OAuth
      redirect(data.url)
    }

    return { success: false, error: 'No OAuth URL returned' }
  } catch (error) {
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

async function getBaseUrl(): Promise<string> {
  // First try environment variable
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL
  }

  // Fallback to header origin
  try {
    const headersList = await headers()
    const origin = headersList.get('origin') || headersList.get('host')

    if (origin) {
      return origin.startsWith('http') ? origin : `https://${origin}`
    }
  } catch (error) {
    console.warn('Could not get origin from headers:', error)
  }

  // Final fallback
  return process.env.NODE_ENV === 'production'
    ? 'https://blog.ajy720.me'
    : 'http://localhost:3000'
}
