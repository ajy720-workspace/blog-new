'use client'

import { useMemo } from 'react'

import { ExtendedRecordMap, PageBlock } from 'notion-types'
import { getPageTableOfContents } from 'notion-utils'

export interface TOCItem {
  id: string
  text: string
  level: number
  indentLevel: number
}

interface UseTOCProps {
  recordMap: ExtendedRecordMap | null
}

export function useTOC({ recordMap }: UseTOCProps) {
  const tocItems = useMemo(() => {
    if (!recordMap) return []

    try {
      // recordMap에서 페이지 타입의 블록을 찾기
      const pageBlocks = Object.values(recordMap.block || {})
        .filter(block => block?.value?.type === 'page')
        .map(block => block.value as PageBlock)

      if (pageBlocks.length === 0) return []

      const pageBlock = pageBlocks[0]
      const toc = getPageTableOfContents(pageBlock, recordMap)

      return toc.map((item, index) => {
        // Use the same ID format as react-notion-x
        const headingId = item.id
          ? item.id.replace(/-/g, '')
          : `heading-${index}`

        return {
          id: headingId,
          text: item.text || '',
          level: item.indentLevel || 1,
          indentLevel: item.indentLevel || 0,
        }
      }) as TOCItem[]
    } catch (error) {
      console.warn('Failed to extract table of contents:', error)
      return []
    }
  }, [recordMap])

  return {
    tocItems,
    hasTOC: tocItems.length > 0,
  }
}
