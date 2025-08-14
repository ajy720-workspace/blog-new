'use client'

import { Grid, List, Rows } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ViewMode, viewModeOptions } from '@/lib/utils/search-utils'

interface ViewModeToggleProps {
  value: ViewMode
  onChange: (viewMode: ViewMode) => void
  className?: string
}

export function ViewModeToggle({
  value,
  onChange,
  className = '',
}: ViewModeToggleProps) {
  return (
    <div className={`flex border rounded-md overflow-hidden ${className}`}>
      {viewModeOptions.map(mode => {
        const IconComponent =
          mode.icon === 'Grid' ? Grid : mode.icon === 'List' ? List : Rows
        return (
          <Button
            key={mode.value}
            variant={value === mode.value ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onChange(mode.value)}
            className="rounded-none border-0"
            title={mode.label}
          >
            <IconComponent className="w-4 h-4" />
          </Button>
        )
      })}
    </div>
  )
}
