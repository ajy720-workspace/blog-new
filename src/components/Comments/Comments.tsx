'use client'

import { useState, useCallback } from 'react'
import CommentForm from './CommentForm'
import CommentList from './CommentList'
import type { Comment } from '@/types/comments'

interface CommentsProps {
  notionPageId: string
  initialComments: Comment[]
  className?: string
}

export default function Comments({
  notionPageId,
  initialComments,
  className = '',
}: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments)

  const handleCommentSubmitted = useCallback((newComment: Comment) => {
    // Add the new comment to the top of the list (newest first)
    setComments(prevComments => [newComment, ...prevComments])
  }, [])

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
