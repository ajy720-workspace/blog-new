'use client'

import { useState, useActionState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Github, X, CheckCircle, AlertCircle } from 'lucide-react'
import { signInWithGitHub } from '@/app/actions/auth'

interface OAuthModalProps {
  isOpen: boolean
  onClose: () => void
  trigger?: 'comment' | 'general'
  redirectTo?: string
}

export function OAuthModal({
  isOpen,
  onClose,
  trigger = 'general',
  redirectTo,
}: OAuthModalProps) {
  const [state, formAction, isPending] = useActionState(signInWithGitHub, null)

  const getTitleByTrigger = () => {
    switch (trigger) {
      case 'comment':
        return 'Save Your Comment'
      default:
        return 'Sign In to Continue'
    }
  }

  const getDescriptionByTrigger = () => {
    switch (trigger) {
      case 'comment':
        return 'Your comment has been posted! Sign in with GitHub to claim it and receive notifications for replies.'
      default:
        return 'Sign in with your GitHub account to access additional features and personalize your experience.'
    }
  }

  const getBenefitsByTrigger = () => {
    switch (trigger) {
      case 'comment':
        return [
          'Claim ownership of your comments',
          'Get notified when someone replies',
          'Edit your comments after posting',
          'Build your contributor profile',
        ]
      default:
        return [
          'Personalized content recommendations',
          'Save your favorite posts',
          'Participate in discussions',
          'Get notified of new content',
        ]
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              {getTitleByTrigger()}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-1 h-auto"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <DialogDescription className="text-base">
            {getDescriptionByTrigger()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Benefits */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Benefits of signing in:</h4>
            <ul className="space-y-2">
              {getBenefitsByTrigger().map((benefit, index) => (
                <li
                  key={index}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          {/* Error */}
          {state?.error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
              <p className="text-sm text-destructive">{state.error}</p>
            </div>
          )}

          {/* Sign In Form */}
          <form action={formAction}>
            <input type="hidden" name="redirectTo" value={redirectTo || ''} />
            <Button
              type="submit"
              disabled={isPending}
              className="w-full"
              size="lg"
            >
              <Github className="w-5 h-5 mr-2" />
              {isPending ? 'Connecting...' : 'Sign in with GitHub'}
            </Button>
          </form>

          {/* Privacy Note */}
          <p className="text-xs text-muted-foreground text-center">
            We only access your public GitHub profile. Your email and private
            information remain private.
          </p>

          {/* Skip Option */}
          <div className="text-center pt-2 border-t">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-sm text-muted-foreground"
            >
              {trigger === 'comment'
                ? 'Maybe later'
                : 'Continue without signing in'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Hook for using the OAuth modal
export function useOAuthModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState<{
    trigger?: 'comment' | 'general'
    redirectTo?: string
  }>({})

  const openModal = (options?: {
    trigger?: 'comment' | 'general'
    redirectTo?: string
  }) => {
    setConfig(options || {})
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
    setConfig({})
  }

  return {
    isOpen,
    openModal,
    closeModal,
    trigger: config.trigger,
    redirectTo: config.redirectTo,
  }
}
