'use client'

import { useEffect } from 'react'

interface Metric {
  name: string
  id: string
  value: number
  delta: number
  rating: 'good' | 'needs-improvement' | 'poor'
}

function sendToAnalytics(metric: Metric) {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    console.log('Web Vital:', metric)
    
    // You can send to your analytics service here
    // Example: Google Analytics 4
    if (typeof window !== 'undefined' && 'gtag' in window) {
      const gtag = (window as unknown as { gtag: (command: string, eventName: string, parameters: Record<string, unknown>) => void }).gtag
      gtag('event', metric.name, {
        event_category: 'Web Vitals',
        event_label: metric.id,
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        non_interaction: true,
      })
    }
  }
}

export function WebVitals() {
  useEffect(() => {
    // Dynamically import web-vitals to avoid SSR issues
    import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
      onCLS(sendToAnalytics)
      onINP(sendToAnalytics) // INP replaced FID in web-vitals v4
      onFCP(sendToAnalytics)
      onLCP(sendToAnalytics)
      onTTFB(sendToAnalytics)
    }).catch((error) => {
      console.error('Failed to load web-vitals:', error)
    })
  }, [])

  return null
}