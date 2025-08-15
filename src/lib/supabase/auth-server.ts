import { createClient as createServerClient } from './server'

export interface UserProfile {
  id: string
  email?: string
  name?: string
  avatar_url?: string
  is_anonymous: boolean
  provider?: string
}

// Server-side functions for server components and actions
export async function getCurrentUserServer() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function getSessionServer() {
  const supabase = await createServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
}

export async function isAnonymousUserServer(): Promise<boolean> {
  const user = await getCurrentUserServer()
  return user?.is_anonymous || false
}

export async function getUserProfileServer(): Promise<UserProfile | null> {
  try {
    const user = await getCurrentUserServer()

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
    console.error('Error getting user profile (server):', error)
    return null
  }
}
