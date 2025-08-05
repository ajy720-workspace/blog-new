'use client'

import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from '@/contexts/theme-context'
import { Button } from '@/components/ui/button'
import type { Theme } from '@/types/theme'
import { FadeInMotion } from '@/components/ui/motion'

const themeIcons = {
  light: Sun,
  dark: Moon,
  system: Monitor,
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const cycleTheme = () => {
    const themes: Theme[] = ['light', 'dark']
    const currentIndex = themes.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }

  const Icon = themeIcons[theme]

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={cycleTheme}
      className="w-8 h-8 p-0"
    >
      <FadeInMotion key={theme}>
        <Icon className="h-4 w-4" />
        <span className="sr-only">Toggle theme</span>
      </FadeInMotion>
    </Button>
  )
}
