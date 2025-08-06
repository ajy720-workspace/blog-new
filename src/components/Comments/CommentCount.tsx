'use client'

import { MessageCircle } from 'lucide-react'

interface CommentCountProps {
  count: number
  className?: string
}

export default function CommentCount({
  count,
  className = '',
}: CommentCountProps) {
  return (
    <div
      className={`flex items-center gap-2 text-muted-foreground ${className}`}
    >
      <MessageCircle className="w-4 h-4" />
      <span className="text-sm">
        {count === 0
          ? 'No comments'
          : `${count} comment${count !== 1 ? 's' : ''}`}
      </span>
    </div>
  )
}
