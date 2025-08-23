'use client'

import { useCallback } from 'react'

interface UseScrollToProps {
  behavior?: ScrollBehavior
}

export function useScrollTo({ behavior = 'smooth' }: UseScrollToProps = {}) {
  const scrollToElement = useCallback(
    (elementId: string) => {
      const element = document.getElementById(elementId)
      if (!element) {
        console.warn(`Element with ID "${elementId}" not found`)
        return
      }

      element.scrollIntoView({ behavior })
    },
    [behavior]
  )

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior,
    })
  }, [behavior])

  return {
    scrollToElement,
    scrollToTop,
  }
}
