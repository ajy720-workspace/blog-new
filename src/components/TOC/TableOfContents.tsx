'use client'

import { useState } from 'react'

import { ExtendedRecordMap } from 'notion-types'

import { useActiveSection } from '@/hooks/useActiveSection'
import { useScrollTo } from '@/hooks/useScrollTo'
import { useTOC } from '@/hooks/useTOC'
import { cn } from '@/lib/utils'

import { TOCBar } from './TOCBar'
import { TOCList } from './TOCList'

interface TableOfContentsProps {
  recordMap: ExtendedRecordMap | null
  className?: string
}

export function TableOfContents({
  recordMap,
  className,
}: TableOfContentsProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { tocItems, hasTOC } = useTOC({ recordMap })
  const activeId = useActiveSection({
    headingIds: tocItems.map(item => item.id),
  })
  const { scrollToElement } = useScrollTo({ offset: 80 })

  const handleItemClick = (id: string) => {
    scrollToElement(id)
    setIsExpanded(false)
  }

  if (!hasTOC) return null

  return (
    <div
      className={cn('notion-table-of-contents', className)}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Minimalist bars */}
      <div
        className={cn(
          'notion-table-of-contents-bars',
          isExpanded ? 'opacity-0' : 'opacity-100'
        )}
      >
        {tocItems.map(item => (
          <TOCBar
            key={item.id}
            item={item}
            isActive={activeId === item.id}
            onClick={handleItemClick}
          />
        ))}
      </div>

      {/* Expanded list */}

      <TOCList
        items={tocItems}
        activeId={activeId}
        onItemClick={handleItemClick}
        className={isExpanded ? 'block' : 'hidden'}
      />
    </div>
  )
}
