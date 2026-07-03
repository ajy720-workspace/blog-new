import { cookies } from 'next/headers'

import { jwtVerify, SignJWT } from 'jose'

import { securityConfig } from '@/config'
import type { AppUser, UserProfile } from '@/types/auth'

import { query } from '@/lib/db/client'

const encoder = new TextEncoder()

interface SessionPayload {
  userId: string
}

function getSessionSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET

  if (!secret) {
    throw new Error('SESSION_SECRET is not defined')
  }

  return encoder.encode(secret)
}

function mapUserProfile(user: AppUser): UserProfile {
  const metadata = user.user_metadata || {}
  const name =
    typeof metadata.full_name === 'string'
      ? metadata.full_name
      : typeof metadata.name === 'string'
        ? metadata.name
        : typeof metadata.user_name === 'string'
          ? metadata.user_name
          : undefined
  const avatarUrl =
    typeof metadata.avatar_url === 'string'
      ? metadata.avatar_url
      : typeof metadata.picture === 'string'
        ? metadata.picture
        : undefined

  return {
    id: user.id,
    email: user.email || undefined,
    name,
    avatar_url: avatarUrl,
    is_anonymous: user.is_anonymous,
    provider: user.provider || undefined,
  }
}

async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ userId: payload.userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${securityConfig.session.maxAge}s`)
    .sign(getSessionSecret())
}

export async function setSession(userId: string): Promise<void> {
  const cookieStore = await cookies()
  const token = await signSession({ userId })

  cookieStore.set(securityConfig.session.cookieName, token, {
    httpOnly: securityConfig.session.httpOnly,
    maxAge: securityConfig.session.maxAge,
    sameSite: securityConfig.session.sameSite,
    secure: securityConfig.session.secure,
    path: '/',
  })
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(securityConfig.session.cookieName, '', {
    httpOnly: securityConfig.session.httpOnly,
    maxAge: 0,
    sameSite: securityConfig.session.sameSite,
    secure: securityConfig.session.secure,
    path: '/',
  })
}

export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(securityConfig.session.cookieName)?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, getSessionSecret())
    return typeof payload.userId === 'string' ? payload.userId : null
  } catch (error) {
    console.error('Invalid session token:', error)
    await clearSession()
    return null
  }
}

export async function getCurrentUserServer(): Promise<AppUser | null> {
  const userId = await getSessionUserId()

  if (!userId) return null

  const { rows } = await query<AppUser>(
    `SELECT id, email, is_anonymous, provider, provider_user_id, user_metadata,
            created_at, updated_at
       FROM app_users
      WHERE id = $1`,
    [userId]
  )

  return rows[0] || null
}

export async function getUserProfileServer(): Promise<UserProfile | null> {
  const user = await getCurrentUserServer()
  return user ? mapUserProfile(user) : null
}

export async function isAnonymousUserServer(): Promise<boolean> {
  const user = await getCurrentUserServer()
  return user?.is_anonymous || false
}

export async function createAnonymousUser(): Promise<AppUser> {
  const { rows } = await query<AppUser>(
    `INSERT INTO app_users (is_anonymous, provider, user_metadata)
     VALUES (true, 'anonymous', '{}'::jsonb)
     RETURNING id, email, is_anonymous, provider, provider_user_id,
               user_metadata, created_at, updated_at`
  )

  return rows[0]
}

export async function ensureAnonymousSession(): Promise<AppUser> {
  const currentUser = await getCurrentUserServer()

  if (currentUser) return currentUser

  const anonymousUser = await createAnonymousUser()
  await setSession(anonymousUser.id)
  return anonymousUser
}
