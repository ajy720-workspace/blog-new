'use client'

import { useCallback } from 'react'

interface UseScrollToProps {
  offset?: number
  behavior?: ScrollBehavior
}

export function useScrollTo({
  offset = 80,
  behavior = 'smooth',
}: UseScrollToProps = {}) {
  const scrollToElement = useCallback(
    (elementId: string) => {
      const element = document.getElementById(elementId)
      if (!element) return

      const elementPosition = element.offsetTop
      const offsetPosition = elementPosition - offset

      window.scrollTo({
        top: offsetPosition,
        behavior,
      })
    },
    [offset, behavior]
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
