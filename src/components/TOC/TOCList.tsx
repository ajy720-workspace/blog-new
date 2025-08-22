'use client'

import { TOCItem } from '@/hooks/useTOC'
import { cn } from '@/lib/utils'

interface TOCItemProps {
  item: TOCItem
  isActive: boolean
  onClick: (id: string) => void
}

function TOCListItem({ item, isActive, onClick }: TOCItemProps) {
  // Get the appropriate CSS class for the indent level
  const getIndentClass = () => {
    const level = Math.min(item.indentLevel, 3) // Cap at level 3
    return `notion-table-of-contents-item-indent-${level}`
  }

  return (
    <button
      onClick={() => onClick(item.id)}
      className={cn(
        'notion-table-of-contents-item',
        getIndentClass(),
        isActive && 'active'
      )}
      title={item.text}
    >
      <span className="notion-table-of-contents-item-text">{item.text}</span>
    </button>
  )
}

interface TOCListProps {
  items: TOCItem[]
  activeId: string
  onItemClick: (id: string) => void
  className?: string
}

export function TOCList({
  items,
  activeId,
  onItemClick,
  className,
}: TOCListProps) {
  if (!items.length) return null

  return (
    <div className={cn('notion-table-of-contents-list', className)}>
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
