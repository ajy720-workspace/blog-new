export interface Profile {
  id: string
  display_name: string
  avatar_url?: string
  provider: string
  created_at: string
  updated_at: string
}

export interface ProfileData {
  display_name: string
  avatar_url?: string | null
  provider: string
}

export interface ProfileUpsertResult {
  success: boolean
  profile?: Profile
  error?: string
}

export type AuthProvider = 'github' | 'google' | 'discord' | 'unknown'
