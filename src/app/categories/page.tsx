import { Metadata } from 'next'
import { getAllCategories } from '@/lib/core/notion'
import { Folder, Grid, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export const revalidate = 3600 // ISR: 1시간마다 재검증

export const metadata: Metadata = {
  title: 'All Categories',
  description: 'Browse all categories and discover content by topic',
  openGraph: {
    title: 'All Categories',
    description: 'Browse all categories and discover content by topic',
  },
}

export default async function CategoriesPage() {
  const categories = await getAllCategories()

  if (categories.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center py-16">
          <Folder className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h1 className="text-3xl font-bold mb-4">No categories available</h1>
          <p className="text-muted-foreground mb-8">
            Categories will appear here once posts are published with
            categories.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Browse all posts
          </Link>
        </div>
      </div>
    )
  }

  const topCategories = categories.slice(0, 3)
  const remainingCategories = categories.slice(3)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Grid className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold">All Categories</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Explore content organized by categories. Each category contains
            related posts grouped by topic or theme.
          </p>
        </div>

        {/* Top Categories Section */}
        {topCategories.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-bold">Top Categories</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {topCategories.map((category, index) => (
                <Link
                  key={category.slug}
                  href={`/category/${category.slug}`}
                  className="group relative p-8 bg-gradient-to-br from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/20 border border-primary/20 rounded-2xl transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                      <Folder className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-xs font-medium text-primary/70 bg-primary/10 px-2 py-1 rounded-full">
                      #{index + 1}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold group-hover:text-primary transition-colors mb-3">
                    {category.name}
                  </h3>

                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-primary">
                      {category.count}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {category.count === 1 ? 'post' : 'posts'} available
                    </p>
                  </div>

                  <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* All Categories Section */}
        {remainingCategories.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Folder className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-bold">All Categories</h2>
              {remainingCategories.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  ({remainingCategories.length} more)
                </span>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {remainingCategories.map(category => (
                <Link
                  key={category.slug}
                  href={`/category/${category.slug}`}
                  className="group p-6 bg-card border rounded-lg hover:shadow-md hover:border-primary/50 transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-secondary rounded-lg group-hover:bg-primary/10 transition-colors">
                      <Folder className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">
                      {category.count}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {category.count === 1 ? 'post' : 'posts'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* All Categories - Single Grid View (if no top categories) */}
        {topCategories.length === 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map(category => (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                className="group p-6 bg-card border rounded-lg hover:shadow-md hover:border-primary/50 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-secondary rounded-lg group-hover:bg-primary/10 transition-colors">
                    <Folder className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-bold text-primary">
                    {category.count}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {category.count === 1 ? 'post' : 'posts'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="mt-16 pt-8 border-t text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">
                {categories.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Categories
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">
                {categories.reduce((sum, category) => sum + category.count, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Posts</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">
                {Math.round(
                  categories.reduce(
                    (sum, category) => sum + category.count,
                    0
                  ) / categories.length
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                Avg Posts per Category
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
