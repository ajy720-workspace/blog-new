'use client'

import { formatDistanceToNow } from 'date-fns'
import type { Comment } from '@/types/comments'

interface CommentItemProps {
  comment: Comment
}

export default function CommentItem({ comment }: CommentItemProps) {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return formatDistanceToNow(date, { addSuffix: true })
    } catch {
      return 'Unknown time'
    }
  }

  if (comment.is_deleted) {
    return (
      <div className="p-4 border rounded-lg bg-muted/50">
        <p className="text-muted-foreground italic">[Comment deleted]</p>
      </div>
    )
  }

  return (
    <div className="p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground text-sm font-medium">
              {comment.author_name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h4 className="font-medium text-foreground">
              {comment.author_name}
            </h4>
            <p className="text-sm text-muted-foreground">
              {formatDate(comment.created_at)}
            </p>
          </div>
        </div>

        {comment.is_anonymous && (
          <span className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-full">
            Anonymous
          </span>
        )}
      </div>

      <div className="prose prose-sm max-w-none dark:prose-invert">
        <p className="text-foreground whitespace-pre-wrap break-words">
          {comment.content}
        </p>
      </div>
    </div>
  )
}
