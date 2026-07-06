'use client'

import { useEffect, useState } from 'react'

import { MessageCircle } from 'lucide-react'

import { getCommentCountState } from '@/app/actions/comments'

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
  const [isDisabled, setIsDisabled] = useState(false)

  useEffect(() => {
    if (count === undefined && notionPageId) {
      const loadCount = async () => {
        try {
          const result = await getCommentCountState(notionPageId)
          setLoadedCount(result.count)
          setIsDisabled(result.disabled)
        } catch (error) {
          console.error('Error loading comment count:', error)
          setLoadedCount(0)
          setIsDisabled(true)
        } finally {
          setIsLoading(false)
        }
      }

      loadCount()
    }
  }, [count, notionPageId])

  const displayCount = loadedCount ?? 0

  if (isLoading) {
    return null
  }

  if (isDisabled) {
    return null
  }

  const scrollToComments = () => {
    const commentsElement = document.getElementById('comments')
    if (commentsElement) {
      commentsElement.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <button
      onClick={scrollToComments}
      className={`flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground cursor-pointer ${className}`}
    >
      <MessageCircle className="w-4 h-4" />
      <span className="text-sm">
        {displayCount === 0
          ? 'No comments'
          : `${displayCount} comment${displayCount !== 1 ? 's' : ''}`}
      </span>
    </button>
  )
}
