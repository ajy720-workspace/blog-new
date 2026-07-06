'use client'

import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

import {
  getUserProfile,
  initAnonymousSession,
  isAnonymousUser,
} from '@/app/actions/auth'
import { getLikeCountAndUserStatus } from '@/app/actions/likes'
import { getAnonymousBrowserId } from '@/lib/utils/anonymous'
import type { UserProfile } from '@/types/auth'

interface LikeContextValue {
  likeCount: number
  isLiked: boolean
  isLoading: boolean
  isSessionReady: boolean
  isDisabled: boolean
  isAnonymous: boolean
  userProfile: UserProfile | null
  updateLikeState: (newCount: number, newIsLiked: boolean) => void
  disableLikes: () => void
  setLoading: (loading: boolean) => void
}

const LikeContext = createContext<LikeContextValue | undefined>(undefined)

interface LikeProviderProps {
  children: ReactNode
  notionPageId: string
  initialLikeCount?: number
  initialIsLiked?: boolean
}

export function LikeProvider({
  children,
  notionPageId,
  initialLikeCount = 0,
  initialIsLiked = false,
}: LikeProviderProps) {
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [isLoading, setIsLoading] = useState(false)
  const [isSessionReady, setIsSessionReady] = useState(false)
  const [isDisabled, setIsDisabled] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isAnonymous, setIsAnonymous] = useState(true)

  // 초기 데이터 로드
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
          setIsDisabled(!!status.disabled)
          setIsSessionReady(true)
        } else {
          console.error('Failed to initialize session:', result.error)
          setIsDisabled(true)
          setIsSessionReady(true)
        }
      } catch (error) {
        console.error('Session initialization error:', error)
        setIsDisabled(true)
        setIsSessionReady(true)
      }
    }
    initSession()
  }, [notionPageId])

  const updateLikeState = useCallback(
    (newCount: number, newIsLiked: boolean) => {
      setLikeCount(newCount)
      setIsLiked(newIsLiked)
    },
    []
  )

  const setLoadingState = useCallback((loading: boolean) => {
    setIsLoading(loading)
  }, [])

  const disableLikes = useCallback(() => {
    setIsDisabled(true)
  }, [])

  const contextValue: LikeContextValue = {
    likeCount,
    isLiked,
    isLoading,
    isDisabled,
    isAnonymous,
    isSessionReady,
    userProfile,
    updateLikeState,
    disableLikes,
    setLoading: setLoadingState,
  }

  return (
    <LikeContext.Provider value={contextValue}>{children}</LikeContext.Provider>
  )
}

export function useLikeContext() {
  const context = useContext(LikeContext)
  if (context === undefined) {
    throw new Error('useLikeContext must be used within a LikeProvider')
  }
  return context
}
