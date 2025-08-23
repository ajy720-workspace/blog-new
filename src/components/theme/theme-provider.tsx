'use client'

import { useCallback, useEffect, useState } from 'react'

import { ThemeContext } from '@/contexts/ThemeContext'
import type { Theme, ThemeProviderProps } from '@/types/theme'

const THEME_STORAGE_KEY = 'project-theme'

export function ThemeProvider({
  children,
  defaultTheme = 'system',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme)
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')

  // 시스템 테마 감지
  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  }

  // 실제 테마 계산
  const calculateResolvedTheme = useCallback(
    (currentTheme: Theme): 'light' | 'dark' => {
      if (currentTheme === 'system') {
        return getSystemTheme()
      }
      return currentTheme
    },
    []
  )

  // 로컬스토리지에서 테마 로드
  useEffect(() => {
    if (typeof window === 'undefined') return

    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      setThemeState(savedTheme)
    }
  }, [])

  // 시스템 테마 변경 감지
  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (theme === 'system') {
        const newSystemTheme = getSystemTheme()
        setResolvedTheme(newSystemTheme)

        // 시스템 테마 변경 이벤트 발생
        window.dispatchEvent(
          new CustomEvent('theme-system-change', {
            detail: { theme: newSystemTheme },
          })
        )
      }
    }

    // 초기 시스템 테마 설정
    if (theme === 'system') {
      setResolvedTheme(getSystemTheme())
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  // 테마 변경 시 DOM 업데이트
  useEffect(() => {
    const newResolvedTheme = calculateResolvedTheme(theme)
    setResolvedTheme(newResolvedTheme)

    if (typeof window === 'undefined') return

    const root = window.document.documentElement

    // 다크/라이트 모드 클래스 토글
    root.classList.remove('light', 'dark')
    root.classList.add(newResolvedTheme)

    // 컬러 테마 클래스 추가
  }, [theme, calculateResolvedTheme])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme)
    }
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}
