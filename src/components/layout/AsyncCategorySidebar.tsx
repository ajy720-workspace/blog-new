import { Suspense } from 'react'

import { CategorySidebarSkeleton } from '@/components/ui/loading-states'

import { CategorySidebarServer } from './CategorySidebarServer'

export function AsyncCategorySidebar() {
  return (
    <Suspense fallback={<CategorySidebarSkeleton />}>
      <CategorySidebarServer />
    </Suspense>
  )
}
