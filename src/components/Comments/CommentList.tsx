'use client'

import { Suspense } from 'react'
import CommentItem from './CommentItem'
import type { Comment } from '@/types/comments'

interface CommentListProps {
  comments: Comment[]
  isLoading?: boolean
}

function CommentListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="p-4 border rounded-lg animate-pulse">
          <div className="flex items-start space-x-3 mb-3">
            <div className="w-8 h-8 bg-muted rounded-full"></div>
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-muted rounded w-24"></div>
              <div className="h-3 bg-muted rounded w-16"></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function CommentList({
  comments,
  isLoading = false,
}: CommentListProps) {
  if (isLoading) {
    return (
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Comments</h3>
        <CommentListSkeleton />
      </div>
    )
  }

  if (comments.length === 0) {
    return (
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Comments</h3>
        <div className="text-center py-8 text-muted-foreground">
          <p>No comments yet. Be the first to share your thoughts!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4">
        Comments ({comments.length})
      </h3>

      <div className="space-y-4">
        <Suspense fallback={<CommentListSkeleton />}>
          {comments.map(comment => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </Suspense>
      </div>
    </div>
  )
}
