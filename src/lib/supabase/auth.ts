import { createClient } from './client'

export async function initAnonymousSession(): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const supabase = createClient()

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

export async function getCurrentUser() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function getSession() {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
}

export async function signInWithGitHub(redirectTo?: string): Promise<{
  success: boolean
  error?: string
  url?: string
}> {
  try {
    const supabase = createClient()

    const baseUrl =
      typeof window !== 'undefined'
        ? window.location.origin
        : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${baseUrl}/auth/callback${redirectTo ? `?next=${encodeURIComponent(redirectTo)}` : ''}`,
      },
    })

    if (error) {
      console.error('GitHub OAuth sign in error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, url: data.url }
  } catch (error) {
    console.error('GitHub OAuth error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function signOut(): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const supabase = createClient()
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

export async function isAnonymousUser(): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.is_anonymous || false
}

export interface UserProfile {
  id: string
  email?: string
  name?: string
  avatar_url?: string
  is_anonymous: boolean
  provider?: string
}

export async function getUserProfile(): Promise<UserProfile | null> {
  try {
    const user = await getCurrentUser()

    if (!user) return null

    return {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name || user.user_metadata?.name,
      avatar_url: user.user_metadata?.avatar_url,
      is_anonymous: user.is_anonymous || false,
      provider: user.app_metadata?.provider,
    }
  } catch (error) {
    console.error('Error getting user profile:', error)
    return null
  }
}
