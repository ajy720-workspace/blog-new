import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'

import { transferUserComments } from '@/app/actions/comments'
import { transferUserLikes } from '@/app/actions/likes'
import { securityConfig, siteConfig } from '@/config'
import {
  exchangeGitHubCode,
  getGitHubPrimaryEmail,
  getGitHubUser,
} from '@/lib/auth/github'
import { getSessionUserId, setSession } from '@/lib/auth/session'
import { upsertGitHubUser } from '@/lib/auth/users'
import { getPublicOrigin } from '@/lib/utils/origin-detection'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const origin = getPublicOrigin(request.headers, request.url, {
    allowedHosts: securityConfig.allowedHosts,
    fallbackUrl: siteConfig.url,
  })
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    try {
      const currentAnonymousUserId = await getSessionUserId()
      const redirectUrl = `${origin}/auth/callback${
        next ? `?next=${encodeURIComponent(next)}` : ''
      }`
      const accessToken = await exchangeGitHubCode(code, redirectUrl)
      const githubUser = await getGitHubUser(accessToken)
      const email = githubUser.email || (await getGitHubPrimaryEmail(accessToken))
      const authenticatedUser = await upsertGitHubUser(githubUser, email)

      await setSession(authenticatedUser.id)

      if (
        currentAnonymousUserId &&
        currentAnonymousUserId !== authenticatedUser.id
      ) {
        try {
          await Promise.all([
            transferUserComments(currentAnonymousUserId),
            transferUserLikes(currentAnonymousUserId, undefined),
          ])
        } catch (transferError) {
          console.error('Failed to transfer anonymous data:', transferError)
        }
      }

      const redirectTo = `${origin}${next}`
      return redirect(redirectTo)
    } catch (error) {
      // Check if this is the expected Next.js redirect error
      if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
        // This is expected behavior in Next.js 15 - the redirect is working correctly
        throw error // Re-throw to let Next.js handle the redirect
      }
      console.error('OAuth callback error:', error)
    }
  }

  // If there was an error, redirect to an error page or home with error param
  return redirect(`${origin}/?auth_error=oauth_failed`)
}
