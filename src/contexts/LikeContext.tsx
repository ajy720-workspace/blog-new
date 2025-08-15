'use client'

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

import { getLikeCountAndUserStatus } from '@/app/actions/likes'

interface LikeContextValue {
  likeCount: number
  isLiked: boolean
  isLoading: boolean
  updateLikeState: (newCount: number, newIsLiked: boolean) => void
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

  // 초기 데이터 로드
  useEffect(() => {
    async function loadLikeStatus() {
      try {
        const result = await getLikeCountAndUserStatus(notionPageId)
        setLikeCount(result.count)
        setIsLiked(result.isLiked)
      } catch (error) {
        console.error('Failed to load like status:', error)
      }
    }

    loadLikeStatus()
  }, [notionPageId])

  const updateLikeState = useCallback((newCount: number, newIsLiked: boolean) => {
    setLikeCount(newCount)
    setIsLiked(newIsLiked)
  }, [])

  const setLoadingState = useCallback((loading: boolean) => {
    setIsLoading(loading)
  }, [])

  const contextValue: LikeContextValue = {
    likeCount,
    isLiked,
    isLoading,
    updateLikeState,
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