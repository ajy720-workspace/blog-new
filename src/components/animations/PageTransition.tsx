'use client'

import { useEffect, useState } from 'react'

import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'

interface PageTransitionProps {
  children: React.ReactNode
  className?: string
}

export function PageTransition({
  children,
  className = '',
}: PageTransitionProps) {
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(false)
  const [displayChildren, setDisplayChildren] = useState(children)

  useEffect(() => {
    setIsLoading(true)
    setDisplayChildren(children)

    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 150)

    return () => clearTimeout(timer)
  }, [pathname, children])

  return (
    <div
      className={cn(
        'transition-all duration-300 ease-in-out',
        isLoading ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0',
        className
      )}
    >
      {displayChildren}
    </div>
  )
}

// Slide transition for page changes
export function SlidePageTransition({
  children,
  className = '',
  direction = 'right',
}: PageTransitionProps & { direction?: 'left' | 'right' | 'up' | 'down' }) {
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(false)
  const [displayChildren, setDisplayChildren] = useState(children)

  useEffect(() => {
    setIsLoading(true)

    const timer = setTimeout(() => {
      setDisplayChildren(children)
      setIsLoading(false)
    }, 200)

    return () => clearTimeout(timer)
  }, [pathname, children])

  const getTransform = () => {
    if (!isLoading) return 'translate3d(0, 0, 0)'

    switch (direction) {
      case 'left':
        return 'translate3d(-30px, 0, 0)'
      case 'right':
        return 'translate3d(30px, 0, 0)'
      case 'up':
        return 'translate3d(0, -30px, 0)'
      case 'down':
        return 'translate3d(0, 30px, 0)'
      default:
        return 'translate3d(30px, 0, 0)'
    }
  }

  return (
    <div
      className={cn('transition-all duration-300 ease-out', className)}
      style={{
        opacity: isLoading ? 0 : 1,
        transform: getTransform(),
      }}
    >
      {displayChildren}
    </div>
  )
}

// Scale transition for page changes
export function ScalePageTransition({
  children,
  className = '',
  scale = 0.98,
}: PageTransitionProps & { scale?: number }) {
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(false)
  const [displayChildren, setDisplayChildren] = useState(children)

  useEffect(() => {
    setIsLoading(true)

    const timer = setTimeout(() => {
      setDisplayChildren(children)
      setIsLoading(false)
    }, 200)

    return () => clearTimeout(timer)
  }, [pathname, children])

  return (
    <div
      className={cn('transition-all duration-300 ease-out', className)}
      style={{
        opacity: isLoading ? 0 : 1,
        transform: isLoading ? `scale(${scale})` : 'scale(1)',
      }}
    >
      {displayChildren}
    </div>
  )
}

// Loading overlay for smoother transitions
export function PageTransitionOverlay() {
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)

    const timer = setTimeout(() => {
      setIsVisible(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [pathname])

  if (!isVisible) return null

  return (
    <div
      className={cn(
        'fixed inset-0 bg-background/80 backdrop-blur-sm z-50',
        'transition-opacity duration-300',
        isVisible ? 'opacity-100' : 'opacity-0'
      )}
    >
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground">Loading...</span>
        </div>
      </div>
    </div>
  )
}
