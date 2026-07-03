export interface AppUser {
  id: string
  email?: string | null
  is_anonymous: boolean
  provider?: string | null
  provider_user_id?: string | null
  user_metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  email?: string
  name?: string
  avatar_url?: string
  is_anonymous: boolean
  provider?: string
}

export interface GitHubUser {
  id: number
  login: string
  name: string | null
  avatar_url: string | null
  email: string | null
}

export interface GitHubEmail {
  email: string
  primary: boolean
  verified: boolean
  visibility: string | null
}
