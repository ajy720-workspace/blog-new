'use client'

import { TOCItem } from '@/hooks/useTOC'
import { cn } from '@/lib/utils'

interface TOCBarProps {
  item: TOCItem
  isActive: boolean
  onClick: (id: string) => void
  className?: string
}

export function TOCBar({ item, isActive, onClick, className }: TOCBarProps) {
  // Get the appropriate width for the indent level
  const getWidthClass = () => {
    const level = Math.min(item.indentLevel, 2)
    switch (level) {
      case 0:
        return 'w-6'
      case 1:
        return 'w-[18px]'
      case 2:
        return 'w-3'
      default:
        return 'w-6'
    }
  }

  return (
    <button
      onClick={() => onClick(item.id)}
      className={cn(
        'block border-none cursor-pointer h-1 rounded-sm',
        'transition-all duration-150 ease-out',
        'hover:scale-x-125',
        getWidthClass(),
        isActive
          ? 'bg-primary shadow-[0_0_4px_theme(colors.primary/30)]'
          : 'bg-muted-foreground/40 hover:bg-muted-foreground/60',
        className
      )}
      title={item.text}
      aria-label={`Go to ${item.text}`}
    />
  )
}
