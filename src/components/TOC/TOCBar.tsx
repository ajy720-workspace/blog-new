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
  // Get the appropriate CSS class for the indent level
  const getLevelClass = () => {
    const level = Math.min(item.indentLevel, 2) // Cap at level 2
    return `notion-table-of-contents-bar-level-${level}`
  }

  return (
    <button
      onClick={() => onClick(item.id)}
      className={cn(
        'notion-table-of-contents-bar',
        getLevelClass(),
        isActive && 'active',
        className
      )}
      title={item.text}
      aria-label={`Go to ${item.text}`}
    />
  )
}
