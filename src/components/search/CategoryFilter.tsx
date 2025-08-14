'use client'

import { ChevronDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CategoryWithCount } from '@/lib/core/notion'

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
  if (categories.length === 0) return null

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            Categories
            {selectedCategories.length > 0 && (
              <span className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {selectedCategories.length}
              </span>
            )}
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="start">
          <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {categories.map(category => (
            <DropdownMenuCheckboxItem
              key={category.name}
              checked={selectedCategories.includes(category.name)}
              onCheckedChange={checked => onToggle(category.name, checked)}
            >
              <span className="flex items-center justify-between w-full">
                <span>{category.name}</span>
                <span className="text-xs text-muted-foreground">
                  {category.count}
                </span>
              </span>
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
