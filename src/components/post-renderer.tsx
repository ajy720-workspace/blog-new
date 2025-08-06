'use client'

import { NotionRenderer } from 'react-notion-x'
import { Code } from 'react-notion-x/build/third-party/code'
import { Equation } from 'react-notion-x/build/third-party/equation'
import { Modal } from 'react-notion-x/build/third-party/modal'
import { Pdf } from 'react-notion-x/build/third-party/pdf'
import { useTheme } from 'next-themes'
import { ExtendedRecordMap } from 'notion-types'

interface PostRendererProps {
  blocks: ExtendedRecordMap
}

export function PostRenderer({ blocks }: PostRendererProps) {
  const { theme } = useTheme()

  return (
    <NotionRenderer
      disableHeader={true}
      showTableOfContents={true}
      recordMap={blocks}
      fullPage={false}
      darkMode={theme === 'dark'}
      previewImages={true}
      showCollectionViewDropdown={true}
      components={{
        Code,
        Equation,
        Modal,
        Pdf,
      }}
    />
  )
}
