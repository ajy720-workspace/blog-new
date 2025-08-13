'use client'

import { useEffect } from 'react'
import { NotionRenderer } from 'react-notion-x'
import { Code } from 'react-notion-x/build/third-party/code'
import { Equation } from 'react-notion-x/build/third-party/equation'
import { Modal } from 'react-notion-x/build/third-party/modal'
import { Pdf } from 'react-notion-x/build/third-party/pdf'

import { useTheme } from '@/contexts/theme-context'

import './post-renderer.css'

interface PostRendererProps {
  // eslint-disable-next-line
  blocks: any
}

export function PostRenderer({ blocks }: PostRendererProps) {
  const { theme } = useTheme()

  useEffect(() => {}, [theme])

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
