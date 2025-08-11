'use client'

import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
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
  const { ref: elementRef, isVisible } = useIntersectionObserver({
    threshold,
    triggerOnce,
  })

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
  const { ref: elementRef, isVisible } = useIntersectionObserver({
    threshold,
    triggerOnce,
  })

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
