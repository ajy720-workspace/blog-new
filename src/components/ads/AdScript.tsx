'use client'

import { useEffect } from 'react'

import Script from 'next/script'

export function AdScript() {
  // useEffect(() => {
  //   const existingScript = document.querySelector(
  //     'script[src="https//t1.daumcdn.net/kas/static/ba.min.js"]'
  //   )

  //   if (!existingScript) {
  //     const script = document.createElement('script')
  //     script.type = 'text/javascript'
  //     script.src = 'https//t1.daumcdn.net/kas/static/ba.min.js'
  //     script.async = true
  //     document.body.appendChild(script)
  //   }
  // }, []) 

  return (
    <script
      async
      type="text/javascript" 
      src="https://t1.daumcdn.net/kas/static/ba.min.js"
    ></script>
  )
}
