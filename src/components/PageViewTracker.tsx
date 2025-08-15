'use client'

import { useEffect } from 'react'

import { usePathname, useSearchParams } from 'next/navigation'

import { trackPageView } from './GoogleAnalytics'

export function PageViewTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const url =
      pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '')
    trackPageView(url)
  }, [pathname, searchParams])

  return null
}
