'use client'

import { NotionRenderer } from 'react-notion-x'
import { Code } from 'react-notion-x/build/third-party/code'
import { Collection } from 'react-notion-x/build/third-party/collection'
import { Equation } from 'react-notion-x/build/third-party/equation'
import { Modal } from 'react-notion-x/build/third-party/modal'
import { Pdf } from 'react-notion-x/build/third-party/pdf'
import dynamic from 'next/dynamic'

// const Tweets = dynamic(
//   () => import('react-notion-x/build/third-party/tweet').then(m => m.Tweet),
//   {
//     ssr: false,
//   }
// )

interface PostRendererProps {
  blocks: unknown[]
}

export function PostRenderer({ blocks }: PostRendererProps) {
  const recordMap = {
    block: {},
    collection: {},
    collection_view: {},
    notion_user: {},
    signed_urls: {},
  }

  blocks.forEach(block => {
    recordMap.block[block.id] = {
      role: 'reader',
      value: block,
    }
  })

  const rootBlockId = blocks[0]?.id

  if (!rootBlockId) {
    return <div>No content available</div>
  }

  return (
    <NotionRenderer
      recordMap={recordMap}
      fullPage={false}
      darkMode={false}
      rootPageId={rootBlockId}
      previewImages={true}
      showCollectionViewDropdown={false}
      components={{
        Code,
        Collection,
        Equation,
        Modal,
        Pdf,
        // Tweet: Tweets,
      }}
      mapPageUrl={pageId => `/${pageId}`}
      mapImageUrl={url => {
        return url
      }}
    />
  )
}
