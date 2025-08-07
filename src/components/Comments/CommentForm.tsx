'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import {
  initAnonymousSession,
  getUserProfile,
  isAnonymousUser,
  type UserProfile,
} from '@/lib/supabase/auth'
import { OAuthModal, useOAuthModal } from '@/components/auth/OAuthModal'
import {
  validateCommentForm,
  sanitizeCommentFormData,
} from '@/lib/supabase/validation'
import type { CommentFormProps, CommentFormState } from '@/types/comments'
import { submitComment } from '@/app/actions/comments'
import { User, CheckCircle } from 'lucide-react'

export default function CommentForm({
  notionPageId,
  onCommentSubmitted,
}: CommentFormProps) {
  const router = useRouter()
  const [formState, setFormState] = useState<CommentFormState>({
    authorName: '',
    content: '',
    authorEmail: '',
    errors: [],
    isSubmitting: false,
  })
  const [isSessionReady, setIsSessionReady] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isAnonymous, setIsAnonymous] = useState(true)
  const oauthModal = useOAuthModal()

  // Initialize session and check user authentication status
  useEffect(() => {
    const initSession = async () => {
      try {
        const result = await initAnonymousSession()
        if (result.success) {
          // Get user profile and check if anonymous
          const profile = await getUserProfile()
          const anonymous = await isAnonymousUser()

          setUserProfile(profile)
          setIsAnonymous(anonymous)

          // Pre-fill form if user is authenticated
          if (profile && !anonymous) {
            setFormState(prev => ({
              ...prev,
              authorName: profile.name || profile.email || '',
              authorEmail: profile.email || '',
            }))
          }

          setIsSessionReady(true)
        } else {
          console.error('Failed to initialize session:', result.error)
        }
      } catch (error) {
        console.error('Session initialization error:', error)
      }
    }

    initSession()
  }, [])

  const handleInputChange = (field: keyof CommentFormState, value: string) => {
    setFormState(prev => ({
      ...prev,
      [field]: value,
      errors: prev.errors.filter(error => error.field !== field),
    }))

    // Clear success message when user starts typing
    if (submitSuccess) {
      setSubmitSuccess(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isSessionReady) {
      return
    }

    setFormState(prev => ({ ...prev, isSubmitting: true, errors: [] }))

    try {
      // Sanitize and validate form data
      const sanitizedData = sanitizeCommentFormData({
        authorName: formState.authorName,
        content: formState.content,
        authorEmail: formState.authorEmail,
      })

      const validationErrors = validateCommentForm(sanitizedData)

      if (validationErrors.length > 0) {
        setFormState(prev => ({
          ...prev,
          errors: validationErrors,
          isSubmitting: false,
        }))
        return
      }

      // Submit comment via Server Action
      const result = await submitComment(sanitizedData, notionPageId)

      if (result.success && result.comment) {
        // Success: reset form and show success message
        setFormState({
          authorName:
            userProfile && !isAnonymous
              ? userProfile.name || userProfile.email || ''
              : '',
          content: '',
          authorEmail:
            userProfile && !isAnonymous ? userProfile.email || '' : '',
          errors: [],
          isSubmitting: false,
        })
        setSubmitSuccess(true)

        // Notify parent component
        onCommentSubmitted(result.comment)

        // Show OAuth modal for anonymous users after successful comment
        if (isAnonymous) {
          setTimeout(() => {
            oauthModal.openModal({
              trigger: 'comment',
              redirectTo: window.location.pathname,
            })
          }, 1000) // Delay to let user see success message
        }

        // Refresh the page to show new comment
        router.refresh()
      } else {
        // Error: show error message
        setFormState(prev => ({
          ...prev,
          errors: [
            {
              field: 'content',
              message: result.error || 'Failed to submit comment',
            },
          ],
          isSubmitting: false,
        }))
      }
    } catch (error) {
      console.error('Comment submission error:', error)
      setFormState(prev => ({
        ...prev,
        errors: [{ field: 'content', message: 'An unexpected error occurred' }],
        isSubmitting: false,
      }))
    }
  }

  const getFieldError = (field: keyof CommentFormState) => {
    return formState.errors.find(error => error.field === field)?.message
  }

  if (!isSessionReady) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
        <span className="ml-2 text-muted-foreground">
          Initializing comment system...
        </span>
      </div>
    )
  }

  return (
    <div className="mt-8 border-t pt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Leave a Comment</h3>

        {/* User Status */}
        {userProfile && (
          <div className="flex items-center gap-2 text-sm">
            {isAnonymous ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="w-4 h-4" />
                <span>Anonymous</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => oauthModal.openModal({ trigger: 'general' })}
                  className="text-primary hover:text-primary/80 p-0 h-auto"
                >
                  Sign in
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span>
                  Signed in as {userProfile.name || userProfile.email}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {submitSuccess && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Thank you! Your comment has been submitted successfully.
          </div>
          {isAnonymous && (
            <p className="text-sm mt-2 opacity-80">
              💡 Sign in to claim your comment and get notified of replies.
            </p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="authorName" className="mb-2">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="authorName"
              type="text"
              value={formState.authorName}
              onChange={e => handleInputChange('authorName', e.target.value)}
              placeholder="Your name"
              maxLength={100}
              disabled={
                formState.isSubmitting || (!isAnonymous && !!userProfile)
              }
              className={getFieldError('authorName') ? 'border-red-500' : ''}
            />
            {getFieldError('authorName') && (
              <p className="text-sm text-red-600 mt-1">
                {getFieldError('authorName')}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="authorEmail" className="mb-2">
              Email (optional)
            </Label>
            <Input
              id="authorEmail"
              type="email"
              value={formState.authorEmail}
              onChange={e => handleInputChange('authorEmail', e.target.value)}
              placeholder="your@email.com"
              maxLength={255}
              disabled={
                formState.isSubmitting || (!isAnonymous && !!userProfile)
              }
              className={getFieldError('authorEmail') ? 'border-red-500' : ''}
            />
            {getFieldError('authorEmail') && (
              <p className="text-sm text-red-600 mt-1">
                {getFieldError('authorEmail')}
              </p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="content" className="mb-2">
            Comment <span className="text-red-500">*</span>
          </Label>
          <textarea
            id="content"
            value={formState.content}
            onChange={e => handleInputChange('content', e.target.value)}
            placeholder="Share your thoughts..."
            maxLength={2000}
            rows={4}
            disabled={formState.isSubmitting}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical min-h-[100px] ${
              getFieldError('content')
                ? 'border-red-500'
                : 'border-gray-300 dark:border-gray-600'
            } ${formState.isSubmitting ? 'opacity-50 cursor-not-allowed' : ''} bg-background text-foreground`}
          />
          <div className="flex justify-between items-center mt-1">
            {getFieldError('content') && (
              <p className="text-sm text-red-600">{getFieldError('content')}</p>
            )}
            <p className="text-sm text-muted-foreground ml-auto">
              {formState.content.length}/2000 characters
            </p>
          </div>
        </div>

        <Button
          type="submit"
          disabled={
            formState.isSubmitting ||
            !formState.authorName.trim() ||
            !formState.content.trim()
          }
          className="w-full md:w-auto"
        >
          {formState.isSubmitting ? (
            <>
              <LoadingSpinner className="w-4 h-4 mr-2" />
              Submitting...
            </>
          ) : (
            'Submit Comment'
          )}
        </Button>
      </form>

      {/* OAuth Modal */}
      <OAuthModal
        isOpen={oauthModal.isOpen}
        onClose={oauthModal.closeModal}
        trigger={oauthModal.trigger}
        redirectTo={oauthModal.redirectTo}
      />
    </div>
  )
}
