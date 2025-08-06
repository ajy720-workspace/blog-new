'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface StaggeredListProps {
  children: React.ReactNode[]
  staggerDelay?: number
  initialDelay?: number
  duration?: number
  direction?: 'up' | 'down' | 'left' | 'right'
  distance?: number
  className?: string
  childClassName?: string
  triggerOnce?: boolean
  threshold?: number
}

export function StaggeredList({
  children,
  staggerDelay = 100,
  initialDelay = 0,
  duration = 600,
  direction = 'up',
  distance = 30,
  className = '',
  childClassName = '',
  triggerOnce = true,
  threshold = 0.1,
}: StaggeredListProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [hasTriggered, setHasTriggered] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

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

    observer.observe(container)

    return () => {
      observer.unobserve(container)
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
    <div ref={containerRef} className={cn(className)}>
      {children.map((child, index) => (
        <div
          key={index}
          className={cn('transition-all ease-out', childClassName)}
          style={{
            opacity: isVisible ? 1 : 0,
            transform: getTransform(),
            transitionDelay: `${initialDelay + index * staggerDelay}ms`,
            transitionDuration: `${duration}ms`,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  )
}

// Staggered grid animation for cards
export function StaggeredGrid({
  children,
  staggerDelay = 150,
  initialDelay = 0,
  duration = 700,
  className = '',
  childClassName = '',
  triggerOnce = true,
  threshold = 0.1,
  scale = 0.95,
}: Omit<StaggeredListProps, 'direction' | 'distance'> & { scale?: number }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [hasTriggered, setHasTriggered] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

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

    observer.observe(container)

    return () => {
      observer.unobserve(container)
    }
  }, [triggerOnce, hasTriggered, threshold])

  return (
    <div ref={containerRef} className={cn(className)}>
      {children.map((child, index) => (
        <div
          key={index}
          className={cn('transition-all ease-out', childClassName)}
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible
              ? 'scale(1) translateY(0)'
              : `scale(${scale}) translateY(20px)`,
            transitionDelay: `${initialDelay + index * staggerDelay}ms`,
            transitionDuration: `${duration}ms`,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  )
}

// Wave animation for list items
export function StaggeredWave({
  children,
  waveDelay = 80,
  initialDelay = 0,
  duration = 400,
  amplitude = 20,
  className = '',
  childClassName = '',
  triggerOnce = true,
  threshold = 0.1,
}: Omit<StaggeredListProps, 'direction' | 'distance' | 'staggerDelay'> & {
  waveDelay?: number
  amplitude?: number
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [hasTriggered, setHasTriggered] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

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

    observer.observe(container)

    return () => {
      observer.unobserve(container)
    }
  }, [triggerOnce, hasTriggered, threshold])

  return (
    <div ref={containerRef} className={cn(className)}>
      {children.map((child, index) => (
        <div
          key={index}
          className={cn('transition-all ease-out', childClassName)}
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible
              ? 'translateY(0)'
              : `translateY(${Math.sin(index * 0.5) * amplitude + amplitude}px)`,
            transitionDelay: `${initialDelay + index * waveDelay}ms`,
            transitionDuration: `${duration}ms`,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  )
}
