'use client'

import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import { Heart } from 'lucide-react'

import { getLikeCountAndUserStatus, toggleLike } from '@/app/actions/likes'
import { OAuthModal, useOAuthModal } from '@/components/auth/OAuthModal'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import {
  type UserProfile,
  getUserProfile,
  initAnonymousSession,
  isAnonymousUser,
} from '@/lib/supabase/auth'
import { getAnonymousBrowserId } from '@/lib/utils/anonymous'
import type { LikeButtonProps } from '@/types/likes'

export function LikeButton({
  notionPageId,
  initialLikeCount = 0,
  initialIsLiked = false,
  className = '',
  showCount = true,
}: LikeButtonProps) {
  const router = useRouter()
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [isLoading, setIsLoading] = useState(false)
  const [isSessionReady, setIsSessionReady] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isAnonymous, setIsAnonymous] = useState(true)
  const oauthModal = useOAuthModal()

  // Initialize session and get current like status
  useEffect(() => {
    const initSession = async () => {
      try {
        const result = await initAnonymousSession()
        if (result.success) {
          const [profile, anonymous] = await Promise.all([
            getUserProfile(),
            isAnonymousUser(),
          ])

          setUserProfile(profile)
          setIsAnonymous(anonymous)

          // Get current like status
          const anonymousBrowserId = getAnonymousBrowserId()
          const anonymousSessionId = profile?.id

          const status = await getLikeCountAndUserStatus(
            notionPageId,
            anonymousSessionId,
            anonymousBrowserId
          )

          setLikeCount(status.count)
          setIsLiked(status.isLiked)
          setIsSessionReady(true)
        } else {
          console.error('Failed to initialize session:', result.error)
        }
      } catch (error) {
        console.error('Session initialization error:', error)
      }
    }

    initSession()
  }, [notionPageId])

  const handleLikeClick = async () => {
    if (!isSessionReady || isLoading) {
      return
    }

    setIsLoading(true)

    try {
      const anonymousBrowserId = getAnonymousBrowserId()
      const anonymousSessionId = userProfile?.id

      // Optimistic update
      const newIsLiked = !isLiked
      const newCount = newIsLiked ? likeCount + 1 : likeCount - 1

      setIsLiked(newIsLiked)
      setLikeCount(newCount)

      // Call server action
      const result = await toggleLike(
        notionPageId,
        anonymousSessionId,
        anonymousBrowserId
      )

      if (result.success) {
        // Update with actual values from server
        setIsLiked(result.isLiked ?? newIsLiked)
        setLikeCount(result.likeCount ?? newCount)

        // Show OAuth modal for anonymous users after successful like
        if (isAnonymous && result.isLiked) {
          setTimeout(() => {
            oauthModal.openModal({
              trigger: 'like',
              redirectTo: window.location.pathname,
            })
          }, 500) // Short delay to let user see the like animation
        }

        // Refresh to update any cached data
        router.refresh()
      } else {
        // Revert optimistic update on error
        setIsLiked(!newIsLiked)
        setLikeCount(likeCount)
        console.error('Error toggling like:', result.error)
      }
    } catch (error) {
      // Revert optimistic update on error
      setIsLiked(!isLiked)
      setLikeCount(likeCount)
      console.error('Like button error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isSessionReady) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <LoadingSpinner className="w-4 h-4" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    )
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLikeClick}
        disabled={isLoading}
        className={`flex items-center gap-2 transition-all duration-200 hover:scale-105 ${className}`}
      >
        <Heart
          className={`w-5 h-5 transition-all duration-200 ${
            isLiked
              ? 'fill-red-500 text-red-500 scale-110'
              : 'text-muted-foreground hover:text-red-400'
          } ${isLoading ? 'animate-pulse' : ''}`}
        />
        {showCount && (
          <span
            className={`text-sm font-medium transition-colors ${
              isLiked ? 'text-red-500' : 'text-muted-foreground'
            }`}
          >
            {likeCount}
          </span>
        )}
        {isLoading && <LoadingSpinner className="w-3 h-3 ml-1" />}
      </Button>

      {/* OAuth Modal */}
      <OAuthModal
        isOpen={oauthModal.isOpen}
        onClose={oauthModal.closeModal}
        trigger={oauthModal.trigger}
        redirectTo={oauthModal.redirectTo}
      />
    </>
  )
}
