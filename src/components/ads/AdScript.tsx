'use client'

import { useEffect } from 'react'

export function AdScript() {
  useEffect(() => {
    const timer = setTimeout(() => {
      const existingScript = document.querySelector(
        'script[src="//t1.daumcdn.net/kas/static/ba.min.js"]'
      )

      if (existingScript) {
        existingScript.remove()
      }

      const script = document.createElement('script')
      script.type = 'text/javascript'
      script.src = '//t1.daumcdn.net/kas/static/ba.min.js'
      script.async = true
      document.body.appendChild(script)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  return null
}
