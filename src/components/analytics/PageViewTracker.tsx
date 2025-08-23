'use client'

import { Suspense, useEffect } from 'react'

import { usePathname, useSearchParams } from 'next/navigation'

import { trackPageView } from './GoogleAnalytics'

function PageViewTrackerInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const url =
      pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '')
    trackPageView(url)
  }, [pathname, searchParams])

  return null
}

export function PageViewTracker() {
  return (
    <Suspense fallback={null}>
      <PageViewTrackerInner />
    </Suspense>
  )
}
