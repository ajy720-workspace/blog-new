import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getPublicOrigin } from '@/lib/utils/origin-detection'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const origin = getPublicOrigin(request.headers, request.url, {
    allowedHosts: ['*.ajy720.me', 'localhost:3000'],
    fallbackUrl:
      process.env.NODE_ENV === 'production'
        ? 'https://blog.ajy720.me'
        : 'http://localhost:3000',
  })
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()

    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (!error) {
        // Successfully authenticated, redirect to the original page or home
        const redirectTo = `${origin}${next}`
        return redirect(redirectTo)
      }
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
