import type { User } from '@supabase/supabase-js'

import type {
  AuthProvider,
  Profile,
  ProfileData,
  ProfileUpsertResult,
} from '@/types/profiles'

import { createClient } from './server'
import { createAdminClient } from './server-admin'

/**
 * Normalize user profile information from various OAuth providers
 */
export function normalizeUserProfile(user: User): ProfileData {
  const provider = (user.app_metadata?.provider as AuthProvider) || 'unknown'
  const metadata = user.user_metadata

  switch (provider) {
    case 'github':
      return {
        display_name:
          metadata?.full_name ||
          metadata?.name ||
          metadata?.user_name ||
          'GitHub User',
        avatar_url: metadata?.avatar_url || null,
        provider: 'github',
      }

    case 'google':
      return {
        display_name: metadata?.full_name || metadata?.name || 'Google User',
        avatar_url: metadata?.picture || metadata?.avatar_url || null,
        provider: 'google',
      }

    case 'discord':
      return {
        display_name:
          metadata?.global_name || metadata?.username || 'Discord User',
        avatar_url: metadata?.avatar_url || null,
        provider: 'discord',
      }

    default:
      return {
        display_name: 'Unknown User',
        avatar_url: null,
        provider: provider,
      }
  }
}

/**
 * Get profile by user ID
 */
export async function getProfile(userId: string): Promise<Profile | null> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No profile found
        return null
      }
      console.error('Error fetching profile:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in getProfile:', error)
    return null
  }
}

/**
 * Get multiple profiles by user IDs
 */
export async function getProfiles(userIds: string[]): Promise<Profile[]> {
  try {
    if (userIds.length === 0) return []

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .in('id', userIds)

    if (error) {
      console.error('Error fetching profiles:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getProfiles:', error)
    return []
  }
}

/**
 * Create or update user profile using admin client (bypasses RLS)
 */
export async function upsertProfile(
  userId: string,
  profileData: ProfileData
): Promise<ProfileUpsertResult> {
  try {
    // Use admin client to bypass RLS for administrative operations
    const adminSupabase = createAdminClient()

    const { data, error } = await adminSupabase.rpc('upsert_profile', {
      user_id: userId,
      user_display_name: profileData.display_name,
      user_avatar_url: profileData.avatar_url,
      user_provider: profileData.provider,
    })

    if (error) {
      console.error('Error upserting profile:', error)
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      profile: data,
    }
  } catch (error) {
    console.error('Error in upsertProfile:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Create profile for authenticated user from their OAuth data
 */
export async function createProfileFromUser(
  user: User
): Promise<ProfileUpsertResult> {
  if (!user.id) {
    return {
      success: false,
      error: 'User ID is required',
    }
  }

  const profileData = normalizeUserProfile(user)
  return await upsertProfile(user.id, profileData)
}
