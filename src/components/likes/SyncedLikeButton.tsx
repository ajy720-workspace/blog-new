'use client'

import { useRouter } from 'next/navigation'

import { Heart } from 'lucide-react'

import { toggleLike } from '@/app/actions/likes'
import { OAuthModal, useOAuthModal } from '@/components/auth/OAuthModal'
import { Button } from '@/components/ui/button'
import { useLikeContext } from '@/contexts/LikeContext'
import { getAnonymousBrowserId } from '@/lib/utils/anonymous'

interface SyncedLikeButtonProps {
  notionPageId: string
  className?: string
  showCount?: boolean
  variant?: 'ghost' | 'default' | 'outline'
}

export function SyncedLikeButton({
  notionPageId,
  className = '',
  showCount = true,
  variant = 'ghost',
}: SyncedLikeButtonProps) {
  const router = useRouter()
  const {
    isLoading,
    isDisabled,
    likeCount,
    isLiked,
    isAnonymous,
    isSessionReady,
    userProfile,
    updateLikeState,
    disableLikes,
    setLoading,
  } = useLikeContext()
  const { openModal, closeModal, isOpen, trigger, redirectTo } = useOAuthModal()

  const handleLikeClick = async () => {
    if (!isSessionReady || isLoading || isDisabled) {
      return
    }

    setLoading(true)

    try {
      const anonymousBrowserId = getAnonymousBrowserId()
      const anonymousSessionId = userProfile?.id

      // Optimistic update
      const newIsLiked = !isLiked
      const newCount = newIsLiked ? likeCount + 1 : likeCount - 1

      updateLikeState(newCount, newIsLiked)

      // Call server action
      const result = await toggleLike(
        notionPageId,
        anonymousSessionId,
        anonymousBrowserId
      )

      if (result.success) {
        // Update with actual values from server

        updateLikeState(
          result.likeCount ?? newCount,
          result.isLiked ?? newIsLiked
        )

        // Show OAuth modal for anonymous users after successful like
        if (isAnonymous && result.isLiked) {
          setTimeout(() => {
            openModal({
              trigger: 'like',
              redirectTo: window.location.pathname,
            })
          }, 500) // Short delay to let user see the like animation
        }

        // Refresh to update any cached data
        router.refresh()
      } else {
        // Revert optimistic update on error
        updateLikeState(likeCount, isLiked)
        if (result.disabled) {
          disableLikes()
          console.error('Likes disabled:', result.error)
          return
        }
        console.error('Error toggling like:', result.error)
      }
    } catch (error) {
      // Revert optimistic update on error
      updateLikeState(likeCount, isLiked)
      console.error('Like button error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isSessionReady) {
    return (
      <Button
        variant={variant}
        size="sm"
        disabled={true}
        className={`flex items-center gap-2`}
      >
        <Heart className="w-5 h-5 transition-all duration-200 text-muted-foreground hover:text-red-400 animate-pulse" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </Button>
    )
  }

  if (isDisabled) {
    return null
  }

  return (
    <>
      <Button
        variant={variant}
        size="sm"
        onClick={handleLikeClick}
        disabled={isLoading}
        className={`flex items-center gap-2 transition-all duration-200 ${className}`}
      >
        <Heart
          className={`w-5 h-5 transition-all duration-200 ${
            isLiked
              ? 'fill-red-500 text-red-500 scale-110'
              : 'text-muted-foreground hover:text-red-500'
          }`}
        />
        {showCount && (
          <span
            className={`text-sm font-medium transition-colors duration-200 ${
              isLiked ? 'text-red-500' : 'text-muted-foreground'
            }`}
          >
            {likeCount}
          </span>
        )}
      </Button>

      {/* OAuth Modal */}
      <OAuthModal
        isOpen={isOpen}
        onClose={closeModal}
        trigger={trigger}
        redirectTo={redirectTo}
      />
    </>
  )
}
