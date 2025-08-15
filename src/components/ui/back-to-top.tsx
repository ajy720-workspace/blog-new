'use client'

import { useEffect, useState } from 'react'

import { ChevronUp } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface BackToTopProps {
  showAfter?: number // Show button after this many pixels of scroll
  className?: string
}

export function BackToTop({ showAfter = 400, className }: BackToTopProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > showAfter) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    // Add event listener
    window.addEventListener('scroll', toggleVisibility, { passive: true })

    // Clean up
    return () => {
      window.removeEventListener('scroll', toggleVisibility)
    }
  }, [showAfter])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  if (!isVisible) {
    return null
  }

  return (
    <Button
      onClick={scrollToTop}
      size="icon"
      className={cn(
        'fixed bottom-8 right-8 z-50 rounded-full shadow-lg transition-all duration-300 ease-in-out',
        'hover:scale-110 hover:shadow-xl',
        'bg-primary text-primary-foreground hover:bg-primary/90',
        className
      )}
      aria-label="Back to top"
    >
      <ChevronUp className="h-5 w-5" />
    </Button>
  )
}
