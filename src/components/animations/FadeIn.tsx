'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface FadeInProps {
  children: React.ReactNode
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  delay?: number
  duration?: number
  distance?: number
  className?: string
  triggerOnce?: boolean
  threshold?: number
}

export function FadeIn({
  children,
  direction = 'up',
  delay = 0,
  duration = 600,
  distance = 30,
  className = '',
  triggerOnce = true,
  threshold = 0.1,
}: FadeInProps) {
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
        rootMargin: '50px',
      }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [triggerOnce, hasTriggered, threshold])

  const getTransform = () => {
    if (isVisible) return 'translate3d(0, 0, 0)'

    switch (direction) {
      case 'up':
        return `translate3d(0, ${distance}px, 0)`
      case 'down':
        return `translate3d(0, -${distance}px, 0)`
      case 'left':
        return `translate3d(${distance}px, 0, 0)`
      case 'right':
        return `translate3d(-${distance}px, 0, 0)`
      default:
        return 'translate3d(0, 0, 0)'
    }
  }

  return (
    <div
      ref={elementRef}
      className={cn('transition-all ease-out', className)}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transitionDelay: `${delay}ms`,
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  )
}

// Fade in with scale effect
export function FadeInScale({
  children,
  delay = 0,
  duration = 600,
  scale = 0.95,
  className = '',
  triggerOnce = true,
  threshold = 0.1,
}: Omit<FadeInProps, 'direction' | 'distance'> & { scale?: number }) {
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
        rootMargin: '50px',
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
        transform: isVisible ? 'scale(1)' : `scale(${scale})`,
        transitionDelay: `${delay}ms`,
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  )
}
