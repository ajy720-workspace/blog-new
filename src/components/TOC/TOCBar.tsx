'use client'

import { TOCItem } from '@/hooks/useTOC'
import { cn } from '@/lib/utils'

interface TOCBarItemProps {
  item: TOCItem
  isActive: boolean
  onClick: (id: string) => void
}

function TOCBarItem({ item, isActive, onClick }: TOCBarItemProps) {
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
          : 'bg-muted-foreground/40 hover:bg-muted-foreground/60'
      )}
      title={item.text}
      aria-label={`Go to ${item.text}`}
    />
  )
}

interface TOCBarProps {
  items: TOCItem[]
  activeId: string
  onItemClick: (id: string) => void
  isExpanded: boolean
  className?: string
}

export function TOCBar({
  items,
  activeId,
  onItemClick,
  isExpanded,
  className,
}: TOCBarProps) {
  if (!items.length) return null

  return (
    <div
      className={cn(
        'flex flex-col items-end gap-2 w-fit h-fit pointer-events-auto',
        'transition-opacity duration-200 ease-out',
        isExpanded ? 'opacity-0' : 'opacity-100',
        className
      )}
    >
      {items.map(item => (
        <TOCBarItem
          key={item.id}
          item={item}
          isActive={activeId === item.id}
          onClick={onItemClick}
        />
      ))}
    </div>
  )
}
