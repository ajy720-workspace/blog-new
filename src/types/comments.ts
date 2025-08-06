export interface Comment {
  id: string
  notion_page_id: string
  author_name: string
  author_email?: string
  content: string
  user_id?: string
  is_anonymous: boolean
  created_at: string
  updated_at: string
  is_deleted: boolean
  ip_address?: string
  user_agent?: string
}

export interface CommentFormData {
  authorName: string
  content: string
  authorEmail?: string
}

export interface CommentFormProps {
  notionPageId: string
  onCommentSubmitted: (comment: Comment) => void
}

export interface CommentListProps {
  notionPageId: string
  comments: Comment[]
}

export interface CommentItemProps {
  comment: {
    id: string
    authorName: string
    content: string
    createdAt: string
    isDeleted: boolean
  }
}

export interface CommentCountProps {
  notionPageId: string
  count?: number
}

export interface CommentSubmissionResult {
  success: boolean
  comment?: Comment
  error?: string
}

export interface CommentValidationError {
  field: 'authorName' | 'content' | 'authorEmail'
  message: string
}

export interface CommentFormState {
  authorName: string
  content: string
  authorEmail: string
  errors: CommentValidationError[]
  isSubmitting: boolean
}
