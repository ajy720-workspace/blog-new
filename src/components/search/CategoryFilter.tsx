'use client'

import { CategoryWithCount } from '@/lib/core/notion'

import { FilterDropdown } from './FilterDropdown'

interface CategoryFilterProps {
  categories: CategoryWithCount[]
  selectedCategories: string[]
  onToggle: (categoryName: string, checked: boolean) => void
  className?: string
}

export function CategoryFilter({
  categories,
  selectedCategories,
  onToggle,
  className = '',
}: CategoryFilterProps) {
  return (
    <FilterDropdown
      label="Categories"
      items={categories}
      selectedItems={selectedCategories}
      onToggle={onToggle}
      searchPlaceholder="Search categories..."
      emptyMessage="No categories found"
      className={className}
    />
  )
}
