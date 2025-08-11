import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

function getPublicOrigin(request: NextRequest): string {
  // 1. Environment variable takes priority (most reliable)
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL
  }

  // 2. Check standard proxy headers
  const forwardedProto = request.headers.get('x-forwarded-proto')
  const forwardedHost = request.headers.get('x-forwarded-host')
  const host = request.headers.get('host')

  // Debug: Log all headers to understand proxy setup
  console.log('Origin detection headers:', {
    'x-forwarded-proto': forwardedProto,
    'x-forwarded-host': forwardedHost,
    'host': host,
    'x-real-ip': request.headers.get('x-real-ip'),
    'x-forwarded-for': request.headers.get('x-forwarded-for'),
    'referer': request.headers.get('referer'),
    'origin': request.headers.get('origin'),
  })

  // Forwarded headers from reverse proxy
  if (forwardedProto && forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`
  }

  // Try to detect Docker container hostname pattern and reject it
  if (host && host.match(/^[a-f0-9]{12,}:?\d*$/)) {
    console.warn(`Detected Docker container hostname: ${host}, trying alternative detection`)
    
    // Try referer as fallback (from OAuth redirect)
    const referer = request.headers.get('referer')
    if (referer) {
      const refererOrigin = new URL(referer).origin
      console.log(`Using referer origin: ${refererOrigin}`)
      return refererOrigin
    }
  }

  // Host header with protocol inference (only if not Docker hostname)
  if (host && !host.match(/^[a-f0-9]{12,}:?\d*$/)) {
    const protocol =
      forwardedProto || (host.includes('localhost') ? 'http' : 'https')
    return `${protocol}://${host}`
  }

  // Final fallback (may be incorrect in proxy environments)
  return new URL(request.url).origin
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const origin = getPublicOrigin(request)
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
