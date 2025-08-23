'use client'

import { TOCItem } from '@/hooks/useTOC'
import { cn } from '@/lib/utils'

interface TOCItemProps {
  item: TOCItem
  isActive: boolean
  onClick: (id: string) => void
}

function TOCListItem({ item, isActive, onClick }: TOCItemProps) {
  // Get the appropriate padding for the indent level
  const getIndentClass = () => {
    const level = Math.min(item.indentLevel, 3)
    switch (level) {
      case 0:
        return 'pl-3'
      case 1:
        return 'pl-7'
      case 2:
        return 'pl-11 opacity-80'
      case 3:
        return 'pl-16 opacity-70'
      default:
        return 'pl-3'
    }
  }

  return (
    <button
      onClick={() => onClick(item.id)}
      className={cn(
        'block w-full py-1 px-2 my-0.5 text-sm leading-[1.5] text-left',
        'bg-transparent border-none rounded cursor-pointer',
        'transition-all duration-100 ease-out',
        'overflow-hidden text-ellipsis whitespace-nowrap',
        getIndentClass(),
        isActive
          ? 'bg-primary/8 text-primary'
          : 'text-muted-foreground/90 hover:bg-muted-foreground/4 hover:text-foreground'
      )}
      title={item.text}
    >
      <span className="block overflow-hidden text-ellipsis whitespace-nowrap">
        {item.text}
      </span>
    </button>
  )
}

interface TOCListProps {
  items: TOCItem[]
  activeId: string
  onItemClick: (id: string) => void
  isExpanded: boolean
  className?: string
}

export function TOCList({
  items,
  activeId,
  onItemClick,
  isExpanded,
  className,
}: TOCListProps) {
  if (!items.length) return null

  return (
    <div
      className={cn(
        'absolute right-0 top-1/2 -translate-y-1/2 min-w-64 max-w-80 max-h-[60vh]',
        'overflow-y-auto pointer-events-auto',
        'bg-background/95 backdrop-blur-xl border border-border rounded-lg',
        'shadow-2xl shadow-black/10 p-2',
        'transition-all duration-150 ease-out origin-right',
        'scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20',
        isExpanded
          ? 'animate-toc-in'
          : 'animate-toc-out opacity-0 pointer-events-none',
        className
      )}
    >
      {items.map(item => (
        <TOCListItem
          key={item.id}
          item={item}
          isActive={activeId === item.id}
          onClick={onItemClick}
        />
      ))}
    </div>
  )
}
