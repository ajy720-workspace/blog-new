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
  const { scrollToElement } = useScrollTo()

  const handleItemClick = (id: string) => {
    scrollToElement(id)
    setIsExpanded(false)
  }

  if (!hasTOC) return null

  return (
    <div
      className={cn(
        'fixed right-5 top-1/2 -translate-y-1/2 z-50 pointer-events-none',
        'hidden lg:block',
        className
      )}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Minimalist bars */}
      <TOCBar
        items={tocItems}
        activeId={activeId}
        onItemClick={handleItemClick}
        isExpanded={isExpanded}
      />

      {/* Expanded list */}
      <TOCList
        items={tocItems}
        activeId={activeId}
        onItemClick={handleItemClick}
        isExpanded={isExpanded}
      />
    </div>
  )
}
