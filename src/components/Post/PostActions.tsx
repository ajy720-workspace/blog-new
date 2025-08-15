'use client'

import { Suspense } from 'react'

import { SyncedLikeButton } from '@/components/Likes'
import { SocialShare } from '@/components/SEO/SocialShare'

interface PostActionsProps {
  notionPageId: string
  title: string
  url: string
  description?: string
  showLikeCount?: boolean
  className?: string
}

export function PostActions({
  notionPageId,
  title,
  url,
  description,
  showLikeCount = true,
  className = '',
}: PostActionsProps) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* 좋아요 버튼 */}
      <SyncedLikeButton
        notionPageId={notionPageId}
        showCount={showLikeCount}
        variant="outline"
      />

      {/* 소셜 공유 버튼 */}
      <Suspense
        fallback={
          <div className="w-20 h-8 bg-muted rounded animate-pulse"></div>
        }
      >
        <SocialShare title={title} url={url} description={description} />
      </Suspense>
    </div>
  )
}
