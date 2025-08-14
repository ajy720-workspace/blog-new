'use client'

import { TagWithCount } from '@/lib/core/notion'

import { FilterDropdown } from './FilterDropdown'

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
  return (
    <FilterDropdown
      label="Tags"
      items={tags}
      selectedItems={selectedTags}
      onToggle={onToggle}
      searchPlaceholder="Search tags..."
      emptyMessage="No tags found"
      className={className}
    />
  )
}
