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

interface FilterItem {
  name: string
  count: number
}

interface FilterDropdownProps<T extends FilterItem> {
  label: string
  items: T[]
  selectedItems: string[]
  onToggle: (itemName: string, checked: boolean) => void
  searchPlaceholder?: string
  emptyMessage?: string
  className?: string
}

export function FilterDropdown<T extends FilterItem>({
  label,
  items,
  selectedItems,
  onToggle,
  searchPlaceholder = `Search ${label.toLowerCase()}...`,
  emptyMessage = `No ${label.toLowerCase()} found`,
  className = '',
}: FilterDropdownProps<T>) {
  const [searchQuery, setSearchQuery] = useState('')

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items
    return items.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [items, searchQuery])

  if (items.length === 0) return null

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            {label}
            {selectedItems.length > 0 && (
              <span className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {selectedItems.length}
              </span>
            )}
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64" align="start" autoFocus={false}>
          <DropdownMenuLabel>Filter by {label}</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Search Input */}
          <div className="p-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground w-3 h-3" />
              <Input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-7 h-8 text-xs"
                autoFocus={true}
                onKeyDown={e => e.stopPropagation()}
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>

          <DropdownMenuSeparator />

          {/* Scrollable Items List */}
          <div className="max-h-48 overflow-y-auto">
            {filteredItems.length > 0 ? (
              filteredItems.map(item => (
                <DropdownMenuCheckboxItem
                  key={item.name}
                  checked={selectedItems.includes(item.name)}
                  onCheckedChange={checked => onToggle(item.name, checked)}
                >
                  <span className="flex items-center justify-between w-full">
                    <span className="text-sm truncate">{item.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {item.count}
                    </span>
                  </span>
                </DropdownMenuCheckboxItem>
              ))
            ) : (
              <div className="p-2 text-sm text-muted-foreground text-center">
                {emptyMessage}
              </div>
            )}
          </div>

          {/* Results Count */}
          {searchQuery && (
            <div className="p-2 border-t">
              <div className="text-xs text-muted-foreground">
                {filteredItems.length} of {items.length} {label.toLowerCase()}
              </div>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
