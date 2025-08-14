'use client'

import { useMemo, useState } from 'react'

import { ChevronDown, Search, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { TagWithCount } from '@/lib/core/notion'

interface TagFilterProps {
  tags: TagWithCount[]
  selectedTags: string[]
  onToggle: (tagName: string, checked: boolean) => void
  className?: string
}

export function TagFilter({
  tags,
  selectedTags,
  onToggle,
  className = '',
}: TagFilterProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Filter tags based on search query
  const filteredTags = useMemo(() => {
    if (!searchQuery.trim()) return tags
    return tags.filter(tag =>
      tag.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [tags, searchQuery])

  if (tags.length === 0) return null

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            Tags
            {selectedTags.length > 0 && (
              <span className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {selectedTags.length}
              </span>
            )}
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64" align="start">
          <DropdownMenuLabel>Filter by Tags</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Search Input */}
          <div className="p-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground w-3 h-3" />
              <Input
                type="text"
                placeholder="Search tags..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-7 h-8 text-xs"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>

          <DropdownMenuSeparator />

          {/* Scrollable Tags List */}
          <div className="max-h-48 overflow-y-auto">
            {filteredTags.length > 0 ? (
              filteredTags.map(tag => (
                <DropdownMenuCheckboxItem
                  key={tag.name}
                  checked={selectedTags.includes(tag.name)}
                  onCheckedChange={checked => onToggle(tag.name, checked)}
                >
                  <span className="flex items-center justify-between w-full">
                    <span className="text-sm truncate">{tag.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {tag.count}
                    </span>
                  </span>
                </DropdownMenuCheckboxItem>
              ))
            ) : (
              <div className="p-2 text-sm text-muted-foreground text-center">
                No tags found
              </div>
            )}
          </div>

          {/* Results Count */}
          {searchQuery && (
            <div className="p-2 border-t">
              <div className="text-xs text-muted-foreground">
                {filteredTags.length} of {tags.length} tags
              </div>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
