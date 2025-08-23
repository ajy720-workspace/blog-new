'use client'

import { useCallback, useEffect, useState } from 'react'

interface UseActiveSectionProps {
  headingIds: string[]
}

// Throttle function to limit scroll event frequency
function throttle<T extends (...args: never[]) => unknown>(
  func: T,
  delay: number
): T {
  let timeoutId: NodeJS.Timeout | null = null
  let lastExecTime = 0
  return ((...args: Parameters<T>) => {
    const currentTime = Date.now()

    if (currentTime - lastExecTime > delay) {
      func(...args)
      lastExecTime = currentTime
    } else {
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(
        () => {
          func(...args)
          lastExecTime = Date.now()
        },
        delay - (currentTime - lastExecTime)
      )
    }
  }) as T
}

export function useActiveSection({ headingIds }: UseActiveSectionProps) {
  const [activeId, setActiveId] = useState<string>('')

  const updateActiveSection = useCallback(() => {
    if (!headingIds.length) return

    const headingElements = headingIds
      .map(id => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)

    if (!headingElements.length) return

    // Find the heading that is currently most visible
    let activeElement: HTMLElement | null = null
    let closestDistance = Infinity

    headingElements.forEach(element => {
      const rect = element.getBoundingClientRect()
      const distanceFromTop = Math.abs(rect.top - 100) // 100px offset from top

      // Consider elements that are visible or close to the top
      if (rect.top <= 150 && distanceFromTop < closestDistance) {
        closestDistance = distanceFromTop
        activeElement = element
      }
    })

    // If no element is close to top, use the first visible one
    if (!activeElement) {
      for (const element of headingElements) {
        const rect = element.getBoundingClientRect()
        if (rect.top > 0 && rect.top < window.innerHeight) {
          activeElement = element
          break
        }
      }
    }

    if (activeElement && activeElement.id !== activeId) {
      setActiveId(activeElement.id)
    }
  }, [headingIds, activeId])

  useEffect(() => {
    if (!headingIds.length) return

    const throttledUpdateActiveSection = throttle(updateActiveSection, 100)

    // Initial call
    updateActiveSection()

    window.addEventListener('scroll', throttledUpdateActiveSection, {
      passive: true,
    })
    window.addEventListener('resize', throttledUpdateActiveSection, {
      passive: true,
    })

    return () => {
      window.removeEventListener('scroll', throttledUpdateActiveSection)
      window.removeEventListener('resize', throttledUpdateActiveSection)
    }
  }, [updateActiveSection, headingIds])

  return activeId
}
