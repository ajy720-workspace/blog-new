import Script from 'next/script'

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void
    dataLayer: unknown[]
  }
}

export function GoogleAnalytics() {
  if (process.env.NODE_ENV !== 'production' || !GA_MEASUREMENT_ID) {
    return null
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_title: document.title,
            page_location: window.location.href,
          });
        `}
      </Script>
    </>
  )
}

// Client-side utility functions for tracking
// These should only be called from Client Components or browser events
export function trackEvent(
  action: string,
  parameters?: {
    event_category?: string
    event_label?: string
    value?: number
    [key: string]: unknown
  }
) {
  // Guard against server-side execution
  if (
    typeof window === 'undefined' ||
    !window.gtag ||
    process.env.NODE_ENV !== 'production'
  ) {
    return
  }

  const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  if (!GA_ID) return

  window.gtag('event', action, parameters)
}

export function trackPageView(url: string, title?: string) {
  // Guard against server-side execution
  if (
    typeof window === 'undefined' ||
    !window.gtag ||
    process.env.NODE_ENV !== 'production'
  ) {
    return
  }

  const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  if (!GA_ID) return

  window.gtag('config', GA_ID, {
    page_location: url,
    page_title: title || document.title,
  })
}
