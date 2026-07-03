import type { GitHubEmail, GitHubUser } from '@/types/auth'

export function getGitHubOAuthUrl(redirectUrl: string, state: string): string {
  const clientId = process.env.GITHUB_CLIENT_ID

  if (!clientId) {
    throw new Error('GITHUB_CLIENT_ID is not defined')
  }

  const url = new URL('https://github.com/login/oauth/authorize')
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('redirect_uri', redirectUrl)
  url.searchParams.set('scope', 'read:user user:email')
  url.searchParams.set('state', state)

  return url.toString()
}

export async function exchangeGitHubCode(
  code: string,
  redirectUrl: string
): Promise<string> {
  const clientId = process.env.GITHUB_CLIENT_ID
  const clientSecret = process.env.GITHUB_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('GitHub OAuth credentials are not configured')
  }

  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUrl,
    }),
  })

  if (!response.ok) {
    throw new Error(`GitHub token exchange failed: ${response.status}`)
  }

  const payload = (await response.json()) as {
    access_token?: string
    error_description?: string
  }

  if (!payload.access_token) {
    throw new Error(payload.error_description || 'GitHub access token missing')
  }

  return payload.access_token
}

export async function getGitHubUser(accessToken: string): Promise<GitHubUser> {
  const response = await fetch('https://api.github.com/user', {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${accessToken}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })

  if (!response.ok) {
    throw new Error(`GitHub user fetch failed: ${response.status}`)
  }

  return (await response.json()) as GitHubUser
}

export async function getGitHubPrimaryEmail(
  accessToken: string
): Promise<string | null> {
  const response = await fetch('https://api.github.com/user/emails', {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${accessToken}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })

  if (!response.ok) {
    return null
  }

  const emails = (await response.json()) as GitHubEmail[]
  return (
    emails.find(email => email.primary && email.verified)?.email ||
    emails.find(email => email.verified)?.email ||
    null
  )
}
