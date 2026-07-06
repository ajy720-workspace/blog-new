'use client'

import { useCallback, useEffect, useState } from 'react'

import { getCommentsState } from '@/app/actions/comments'
import type { Comment } from '@/types/comments'

import CommentForm from './CommentForm'
import CommentList from './CommentList'

interface CommentsProps {
  notionPageId: string
  initialComments?: Comment[]
  className?: string
}

export default function Comments({
  notionPageId,
  initialComments = [],
  className = '',
}: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [isLoading, setIsLoading] = useState(initialComments.length === 0)
  const [isDisabled, setIsDisabled] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      if (initialComments.length === 0) {
        setIsLoading(true)
        try {
          const result = await getCommentsState(notionPageId)
          setComments(result.comments)
          setIsDisabled(result.disabled)
        } catch (error) {
          console.error('Error loading comments:', error)
          setComments([])
          setIsDisabled(true)
        } finally {
          setIsLoading(false)
        }
      }
    }

    loadData()
  }, [notionPageId, initialComments.length])

  const handleCommentSubmitted = useCallback((newComment: Comment) => {
    // Add the new comment to the top of the list (newest first)
    setComments(prevComments => [newComment, ...prevComments])
  }, [])

  const handleDisabled = useCallback(() => {
    setIsDisabled(true)
  }, [])

  if (isLoading) {
    return (
      <div className={`${className} space-y-6`}>
        <div className="h-6 bg-muted rounded w-32 animate-pulse"></div>
        <div className="h-20 bg-muted rounded animate-pulse"></div>
        <div className="h-20 bg-muted rounded animate-pulse"></div>
      </div>
    )
  }

  if (isDisabled) {
    return null
  }

  return (
    <div className={`${className}`}>
      <CommentList comments={comments} />
      <CommentForm
        notionPageId={notionPageId}
        onCommentSubmitted={handleCommentSubmitted}
        onDisabled={handleDisabled}
      />
    </div>
  )
}
