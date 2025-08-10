'use client'

import { useState, useEffect } from 'react'
import { getCommentCount } from '@/app/actions/comments'
import { MessageCircle } from 'lucide-react'

interface CommentCountProps {
  count?: number
  notionPageId?: string
  className?: string
}

export default function CommentCount({
  count,
  notionPageId,
  className = '',
}: CommentCountProps) {
  const [loadedCount, setLoadedCount] = useState<number | null>(count ?? null)
  const [isLoading, setIsLoading] = useState(
    count === undefined && !!notionPageId
  )

  useEffect(() => {
    if (count === undefined && notionPageId) {
      const loadCount = async () => {
        try {
          const commentCount = await getCommentCount(notionPageId)
          setLoadedCount(commentCount)
        } catch (error) {
          console.error('Error loading comment count:', error)
          setLoadedCount(0)
        } finally {
          setIsLoading(false)
        }
      }

      loadCount()
    }
  }, [count, notionPageId])

  const displayCount = loadedCount ?? 0

  if (isLoading) {
    return (
      <div
        className={`flex items-center gap-2 text-muted-foreground ${className}`}
      >
        <MessageCircle className="w-4 h-4" />
        <span className="text-sm">Loading...</span>
      </div>
    )
  }

  return (
    <div
      className={`flex items-center gap-2 text-muted-foreground ${className}`}
    >
      <MessageCircle className="w-4 h-4" />
      <span className="text-sm">
        {displayCount === 0
          ? 'No comments'
          : `${displayCount} comment${displayCount !== 1 ? 's' : ''}`}
      </span>
    </div>
  )
}
