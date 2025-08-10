'use client'

import { useState, useCallback, useEffect } from 'react'
import { getComments } from '@/app/actions/comments'
import CommentForm from './CommentForm'
import CommentList from './CommentList'
import type { Comment } from '@/types/comments'

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

  useEffect(() => {
    const loadData = async () => {
      if (initialComments.length === 0) {
        setIsLoading(true)
        try {
          const fetchedComments = await getComments(notionPageId)
          setComments(fetchedComments)
        } catch (error) {
          console.error('Error loading comments:', error)
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

  if (isLoading) {
    return (
      <div className={`${className} space-y-6`}>
        <div className="h-6 bg-muted rounded w-32 animate-pulse"></div>
        <div className="h-20 bg-muted rounded animate-pulse"></div>
        <div className="h-20 bg-muted rounded animate-pulse"></div>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      <CommentList comments={comments} />
      <CommentForm
        notionPageId={notionPageId}
        onCommentSubmitted={handleCommentSubmitted}
      />
    </div>
  )
}
