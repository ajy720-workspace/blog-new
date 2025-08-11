import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  console.log('GET /auth/callback with')
  console.log(request.url)

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
