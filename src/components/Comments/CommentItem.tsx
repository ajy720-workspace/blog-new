'use client'

import { formatDistanceToNow } from 'date-fns'
import { useState } from 'react'
import type { Comment } from '@/types/comments'

interface CommentItemProps {
  comment: Comment
}

export default function CommentItem({ comment }: CommentItemProps) {
  const [imageError, setImageError] = useState(false)

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return formatDistanceToNow(date, { addSuffix: true })
    } catch {
      return 'Unknown time'
    }
  }

  // Get display information based on profile or fallback to comment data
  const getDisplayInfo = () => {
    if (!comment.is_anonymous && comment.profile) {
      return {
        name: comment.profile.display_name,
        avatarUrl: comment.profile.avatar_url,
        provider: comment.profile.provider,
      }
    }
    return {
      name: comment.author_name,
      avatarUrl: null,
      provider: null,
    }
  }

  const displayInfo = getDisplayInfo()

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
          {/* Profile Avatar or Fallback */}
          <div className="relative">
            {displayInfo.avatarUrl && !imageError ? (
              <img
                src={displayInfo.avatarUrl}
                alt={`${displayInfo.name}'s avatar`}
                className="w-8 h-8 rounded-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground text-sm font-medium">
                  {displayInfo.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-foreground">
                {displayInfo.name}
              </h4>
              {displayInfo.provider && (
                <span className="px-1.5 py-0.5 bg-muted text-muted-foreground text-xs rounded capitalize">
                  {displayInfo.provider}
                </span>
              )}
            </div>
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
