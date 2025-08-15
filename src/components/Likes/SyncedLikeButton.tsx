'use client'

import { useCallback } from 'react'

import { Heart } from 'lucide-react'

import { toggleLike } from '@/app/actions/likes'
import { OAuthModal, useOAuthModal } from '@/components/auth/OAuthModal'
import { Button } from '@/components/ui/button'
import { useLikeContext } from '@/contexts/LikeContext'
import { getUserProfile, isAnonymousUser } from '@/lib/supabase/auth'
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
  const { likeCount, isLiked, isLoading, updateLikeState, setLoading } = useLikeContext()
  const { openModal, closeModal, isOpen, trigger, redirectTo } = useOAuthModal()

  const handleLikeClick = useCallback(async () => {
    if (isLoading) return

    try {
      setLoading(true)

      // 사용자 상태 확인
      const [userProfile, isAnonymous] = await Promise.all([
        getUserProfile(),
        isAnonymousUser(),
      ])

      // 익명 사용자인 경우 OAuth 모달 표시
      if (isAnonymous || !userProfile) {
        openModal({
          trigger: 'like',
        })
        return
      }

      // 좋아요 토글 (낙관적 업데이트)
      const newIsLiked = !isLiked
      const newLikeCount = newIsLiked ? likeCount + 1 : likeCount - 1
      
      updateLikeState(newLikeCount, newIsLiked)

      // 서버에 실제 요청
      const result = await toggleLike(
        notionPageId,
        undefined, // sessionId
        getAnonymousBrowserId()
      )

      if (!result.success) {
        // 실패 시 롤백
        updateLikeState(likeCount, isLiked)
        console.error('Failed to toggle like:', result.error)
      } else {
        // 서버 응답으로 최종 상태 동기화
        updateLikeState(
          result.likeCount ?? newLikeCount, 
          result.isLiked ?? newIsLiked
        )
      }
    } catch (error) {
      // 에러 시 롤백
      updateLikeState(likeCount, isLiked)
      console.error('Error toggling like:', error)
    } finally {
      setLoading(false)
    }
  }, [
    isLoading,
    likeCount,
    isLiked,
    notionPageId,
    openModal,
    updateLikeState,
    setLoading,
  ])

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