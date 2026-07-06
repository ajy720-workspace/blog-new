export interface Like {
  id: string
  notion_page_id: string
  user_id?: string
  anonymous_session_id?: string
  anonymous_browser_id?: string
  ip_address?: string
  user_agent?: string
  is_anonymous: boolean
  created_at: string
  updated_at: string
}

export interface LikeFormData {
  notionPageId: string
  anonymousSessionId?: string
  anonymousBrowserId?: string
}

export interface LikeSubmissionResult {
  success: boolean
  like?: Like
  error?: string
  isLiked?: boolean
  likeCount?: number
  disabled?: boolean
}

export interface LikeCountResult {
  count: number
  isLiked: boolean
  disabled?: boolean
  error?: string
}

export interface LikeStatusResult {
  isLiked: boolean
  likeId?: string
}

export interface LikeButtonProps {
  notionPageId: string
  initialLikeCount?: number
  initialIsLiked?: boolean
  className?: string
  showCount?: boolean
  variant?: 'ghost' | 'default' | 'outline'
}
