import type { AppUser, GitHubUser } from '@/types/auth'
import type { Profile, ProfileData, ProfileUpsertResult } from '@/types/profiles'

import { query, transaction } from '@/lib/db/client'

export function normalizeGitHubProfile(user: GitHubUser): ProfileData {
  return {
    display_name: user.name || user.login || 'GitHub User',
    avatar_url: user.avatar_url,
    provider: 'github',
  }
}

export async function upsertGitHubUser(
  githubUser: GitHubUser,
  email: string | null
): Promise<AppUser> {
  const metadata = {
    full_name: githubUser.name,
    name: githubUser.name,
    user_name: githubUser.login,
    avatar_url: githubUser.avatar_url,
  }

  return transaction(async client => {
    const { rows } = await client.query<AppUser>(
      `INSERT INTO app_users (
         email, is_anonymous, provider, provider_user_id, user_metadata
       )
       VALUES ($1, false, 'github', $2, $3::jsonb)
       ON CONFLICT (provider, provider_user_id)
       DO UPDATE SET
         email = EXCLUDED.email,
         is_anonymous = false,
         user_metadata = EXCLUDED.user_metadata,
         updated_at = NOW()
       RETURNING id, email, is_anonymous, provider, provider_user_id,
                 user_metadata, created_at, updated_at`,
      [email, String(githubUser.id), JSON.stringify(metadata)]
    )

    const appUser = rows[0]
    const profile = normalizeGitHubProfile(githubUser)

    await client.query(
      `INSERT INTO profiles (id, display_name, avatar_url, provider)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id)
       DO UPDATE SET
         display_name = EXCLUDED.display_name,
         avatar_url = EXCLUDED.avatar_url,
         provider = EXCLUDED.provider,
         updated_at = NOW()`,
      [appUser.id, profile.display_name, profile.avatar_url, profile.provider]
    )

    return appUser
  })
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { rows } = await query<Profile>(
    `SELECT id, display_name, avatar_url, provider, created_at, updated_at
       FROM profiles
      WHERE id = $1`,
    [userId]
  )

  return rows[0] || null
}

export async function getProfiles(userIds: string[]): Promise<Profile[]> {
  if (userIds.length === 0) return []

  const { rows } = await query<Profile>(
    `SELECT id, display_name, avatar_url, provider, created_at, updated_at
       FROM profiles
      WHERE id = ANY($1::uuid[])`,
    [userIds]
  )

  return rows
}

export async function upsertProfile(
  userId: string,
  profileData: ProfileData
): Promise<ProfileUpsertResult> {
  try {
    const { rows } = await query<Profile>(
      `SELECT upsert_profile($1, $2, $3, $4).*`,
      [
        userId,
        profileData.display_name,
        profileData.avatar_url,
        profileData.provider,
      ]
    )

    return {
      success: true,
      profile: rows[0],
    }
  } catch (error) {
    console.error('Error in upsertProfile:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
