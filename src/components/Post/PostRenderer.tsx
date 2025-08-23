'use client'

import { useEffect } from 'react'
import { NotionRenderer } from 'react-notion-x'
import { Code } from 'react-notion-x/build/third-party/code'
import { Equation } from 'react-notion-x/build/third-party/equation'
import { Modal } from 'react-notion-x/build/third-party/modal'
import { Pdf } from 'react-notion-x/build/third-party/pdf'

import { TableOfContents } from '@/components/Post/TOC'
import { useTheme } from '@/contexts/ThemeContext'

import './PostRenderer.css'

interface PostRendererProps {
  // eslint-disable-next-line
  blocks: any
}

export function PostRenderer({ blocks }: PostRendererProps) {
  const { theme } = useTheme()

  useEffect(() => {}, [theme])

  const Collection = () => {
    return ''
  }

  return (
    <>
      <NotionRenderer
        disableHeader={true}
        fullPage={false}
        showTableOfContents={false}
        recordMap={blocks}
        darkMode={theme === 'dark'}
        previewImages={false}
        isImageZoomable={true}
        showCollectionViewDropdown={false}
        components={{
          Code,
          Equation,
          Modal,
          Pdf,
          Collection,
        }}
      />
      <TableOfContents recordMap={blocks} />
    </>
  )
}
