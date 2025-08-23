import { getAllCategories } from '@/lib/core/notion'

import { CategorySidebar } from './CategorySidebar'

export async function CategorySidebarServer() {
  const categories = await getAllCategories()

  return <CategorySidebar categories={categories} />
}
