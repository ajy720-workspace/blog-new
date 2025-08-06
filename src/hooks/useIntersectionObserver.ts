'use client'

import { useEffect, useRef, useState } from 'react'

interface UseIntersectionObserverOptions {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
  disabled?: boolean
}

interface UseIntersectionObserverResult {
  ref: React.RefObject<HTMLDivElement | null>
  isVisible: boolean
  entry: IntersectionObserverEntry | null
}

export function useIntersectionObserver({
  threshold = 0.1,
  rootMargin = '50px',
  triggerOnce = true,
  disabled = false,
}: UseIntersectionObserverOptions = {}): UseIntersectionObserverResult {
  const [isVisible, setIsVisible] = useState(false)
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null)
  const [hasTriggered, setHasTriggered] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (disabled || !ref.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setEntry(entry)

        if (entry.isIntersecting && (!triggerOnce || !hasTriggered)) {
          setIsVisible(true)
          if (triggerOnce) {
            setHasTriggered(true)
          }
        } else if (!triggerOnce && !entry.isIntersecting) {
          setIsVisible(false)
        }
      },
      {
        threshold,
        rootMargin,
      }
    )

    observer.observe(ref.current)

    return () => {
      observer.disconnect()
    }
  }, [threshold, rootMargin, triggerOnce, hasTriggered, disabled])

  return { ref, isVisible, entry }
}

// Shared IntersectionObserver manager for better performance
class IntersectionObserverManager {
  private observers: Map<string, IntersectionObserver> = new Map()
  private callbacks: Map<Element, (entry: IntersectionObserverEntry) => void> =
    new Map()

  getObserver(options: IntersectionObserverInit): IntersectionObserver {
    const key = JSON.stringify(options)

    if (!this.observers.has(key)) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          const callback = this.callbacks.get(entry.target)
          if (callback) {
            callback(entry)
          }
        })
      }, options)

      this.observers.set(key, observer)
    }

    return this.observers.get(key)!
  }

  observe(
    element: Element,
    callback: (entry: IntersectionObserverEntry) => void,
    options: IntersectionObserverInit = {}
  ) {
    const observer = this.getObserver(options)
    this.callbacks.set(element, callback)
    observer.observe(element)
  }

  unobserve(element: Element, options: IntersectionObserverInit = {}) {
    const observer = this.getObserver(options)
    this.callbacks.delete(element)
    observer.unobserve(element)
  }

  disconnect() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers.clear()
    this.callbacks.clear()
  }
}

export const observerManager = new IntersectionObserverManager()

// Hook that uses the shared observer manager
export function useSharedIntersectionObserver({
  threshold = 0.1,
  rootMargin = '50px',
  triggerOnce = true,
  disabled = false,
}: UseIntersectionObserverOptions = {}): UseIntersectionObserverResult {
  const [isVisible, setIsVisible] = useState(false)
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null)
  const [hasTriggered, setHasTriggered] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (disabled || !ref.current) return

    const element = ref.current
    const options = { threshold, rootMargin }

    const callback = (observerEntry: IntersectionObserverEntry) => {
      setEntry(observerEntry)

      if (observerEntry.isIntersecting && (!triggerOnce || !hasTriggered)) {
        setIsVisible(true)
        if (triggerOnce) {
          setHasTriggered(true)
        }
      } else if (!triggerOnce && !observerEntry.isIntersecting) {
        setIsVisible(false)
      }
    }

    observerManager.observe(element, callback, options)

    return () => {
      observerManager.unobserve(element, options)
    }
  }, [threshold, rootMargin, triggerOnce, hasTriggered, disabled])

  return { ref, isVisible, entry }
}
