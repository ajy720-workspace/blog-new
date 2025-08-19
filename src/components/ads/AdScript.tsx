'use client'

import { useEffect } from 'react'

let scriptLoaded = false
let scriptLoading = false

export function AdScript() {
  useEffect(() => {
    if (scriptLoaded || scriptLoading) {
      return
    }

    const timer = setTimeout(() => {
      const existingScript = document.querySelector(
        'script[src="//t1.daumcdn.net/kas/static/ba.min.js"]'
      )

      if (!existingScript && !scriptLoading) {
        scriptLoading = true
        const script = document.createElement('script')
        script.type = 'text/javascript'
        script.src = '//t1.daumcdn.net/kas/static/ba.min.js'
        script.async = true

        script.onload = () => {
          scriptLoaded = true
          scriptLoading = false
        }

        script.onerror = () => {
          scriptLoading = false
        }

        document.body.appendChild(script)
      } else if (existingScript) {
        scriptLoaded = true
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  return null
}
