'use client'

import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

interface SlideUpProps {
  children: React.ReactNode
  delay?: number
  duration?: number
  distance?: number
  className?: string
  triggerOnce?: boolean
  threshold?: number
}

export function SlideUp({
  children,
  delay = 0,
  duration = 600,
  distance = 50,
  className = '',
  triggerOnce = true,
  threshold = 0.1,
}: SlideUpProps) {
  const elementRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [hasTriggered, setHasTriggered] = useState(false)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
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
        rootMargin: '100px',
      }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [triggerOnce, hasTriggered, threshold])

  return (
    <div
      ref={elementRef}
      className={cn('transition-all ease-out', className)}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : `translateY(${distance}px)`,
        transitionDelay: `${delay}ms`,
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  )
}

// Slide up with rotation effect
export function SlideUpRotate({
  children,
  delay = 0,
  duration = 800,
  distance = 50,
  rotation = 5,
  className = '',
  triggerOnce = true,
  threshold = 0.1,
}: SlideUpProps & { rotation?: number }) {
  const elementRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [hasTriggered, setHasTriggered] = useState(false)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
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
        rootMargin: '100px',
      }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [triggerOnce, hasTriggered, threshold])

  return (
    <div
      ref={elementRef}
      className={cn('transition-all ease-out', className)}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible
          ? 'translateY(0) rotate(0deg)'
          : `translateY(${distance}px) rotate(${rotation}deg)`,
        transitionDelay: `${delay}ms`,
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  )
}
