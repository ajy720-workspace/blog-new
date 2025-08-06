'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { initAnonymousSession } from '@/lib/supabase/auth'
import {
  validateCommentForm,
  sanitizeCommentFormData,
} from '@/lib/supabase/validation'
import type { CommentFormProps, CommentFormState } from '@/types/comments'
import { submitComment } from '@/app/actions/comments'

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

  // Initialize anonymous session on component mount
  useEffect(() => {
    const initSession = async () => {
      try {
        const result = await initAnonymousSession()
        if (result.success) {
          setIsSessionReady(true)
        } else {
          console.error('Failed to initialize anonymous session:', result.error)
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
          authorName: '',
          content: '',
          authorEmail: '',
          errors: [],
          isSubmitting: false,
        })
        setSubmitSuccess(true)

        // Notify parent component
        onCommentSubmitted(result.comment)

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
      <h3 className="text-lg font-semibold mb-4">Leave a Comment</h3>

      {submitSuccess && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300">
          Thank you! Your comment has been submitted successfully.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="authorName">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="authorName"
              type="text"
              value={formState.authorName}
              onChange={e => handleInputChange('authorName', e.target.value)}
              placeholder="Your name"
              maxLength={100}
              disabled={formState.isSubmitting}
              className={getFieldError('authorName') ? 'border-red-500' : ''}
            />
            {getFieldError('authorName') && (
              <p className="text-sm text-red-600 mt-1">
                {getFieldError('authorName')}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="authorEmail">Email (optional)</Label>
            <Input
              id="authorEmail"
              type="email"
              value={formState.authorEmail}
              onChange={e => handleInputChange('authorEmail', e.target.value)}
              placeholder="your@email.com"
              maxLength={255}
              disabled={formState.isSubmitting}
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
          <Label htmlFor="content">
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
    </div>
  )
}
