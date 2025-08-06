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
