'use client'

import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
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
  const { ref: containerRef, isVisible } = useIntersectionObserver({
    threshold,
    triggerOnce,
  })

  const getTransform = (index: number, visible: boolean) => {
    if (visible) return 'translate3d(0, 0, 0)'

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
            transform: getTransform(index, isVisible),
            transitionDelay: `${
              initialDelay + (isVisible ? index * staggerDelay : 0)
            }ms`,
            transitionDuration: `${duration}ms`,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  )
}

// Specialized staggered grid component for posts
export function StaggeredGrid({
  children,
  staggerDelay = 50,
  initialDelay = 200,
  duration = 800,
  className = '',
  childClassName = '',
  cols = 'auto',
  gap = 6,
}: Omit<StaggeredListProps, 'direction' | 'distance'> & {
  cols?: 'auto' | 1 | 2 | 3 | 4
  gap?: number
}) {
  const { ref: containerRef, isVisible } = useIntersectionObserver({
    threshold: 0.1,
    triggerOnce: true,
  })

  const getGridCols = () => {
    if (cols === 'auto') return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
    return `grid-cols-${cols}`
  }

  return (
    <div
      ref={containerRef}
      className={cn('grid', getGridCols(), `gap-${gap}`, className)}
    >
      {children.map((child, index) => (
        <div
          key={index}
          className={cn('transition-all ease-out', childClassName)}
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible
              ? 'translate3d(0, 0, 0) scale(1)'
              : 'translate3d(0, 20px, 0) scale(0.95)',
            transitionDelay: `${
              initialDelay + (isVisible ? index * staggerDelay : 0)
            }ms`,
            transitionDuration: `${duration}ms`,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  )
}
