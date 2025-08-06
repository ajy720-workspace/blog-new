import { Metadata } from 'next'
import { getAllTags } from '@/lib/notion'
import { Tag, Hash, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'All Tags',
  description: 'Browse all tags and discover content by topic',
  openGraph: {
    title: 'All Tags',
    description: 'Browse all tags and discover content by topic',
  },
}

export default async function TagsPage() {
  const tags = await getAllTags()

  if (tags.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center py-16">
          <Tag className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h1 className="text-3xl font-bold mb-4">No tags available</h1>
          <p className="text-muted-foreground mb-8">
            Tags will appear here once posts are published with tags.
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

  const popularTags = tags.slice(0, 5)
  const remainingTags = tags.slice(5)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Hash className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold">All Tags</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover content by browsing through all available tags. Each tag
            shows the number of posts associated with it.
          </p>
        </div>

        {/* Popular Tags Section */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold">Most Popular Tags</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {popularTags.map((tag, index) => (
              <Link
                key={tag.slug}
                href={`/tag/${tag.slug}`}
                className="group relative p-6 bg-gradient-to-br from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/20 border border-primary/20 rounded-xl transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <Tag className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-xs font-medium text-primary/70">
                      #{index + 1}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-primary">
                    {tag.count} {tag.count === 1 ? 'post' : 'posts'}
                  </span>
                </div>

                <h3 className="text-lg font-bold group-hover:text-primary transition-colors mb-2">
                  {tag.name}
                </h3>

                <p className="text-sm text-muted-foreground">
                  Explore all posts tagged with {tag.name.toLowerCase()}
                </p>

                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* All Tags Section */}
        {remainingTags.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Tag className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-bold">All Tags</h2>
              <span className="text-sm text-muted-foreground">
                ({remainingTags.length} more)
              </span>
            </div>

            {/* Tag Cloud Layout */}
            <div className="flex flex-wrap gap-3">
              {remainingTags.map(tag => {
                // Size based on post count (relative to max count)
                const maxCount = Math.max(...tags.map(t => t.count))
                const relativeSize = (tag.count / maxCount) * 100

                let sizeClass = 'text-sm px-3 py-2'
                if (relativeSize > 70) sizeClass = 'text-xl px-4 py-3'
                else if (relativeSize > 40) sizeClass = 'text-lg px-4 py-2'
                else if (relativeSize > 20) sizeClass = 'text-base px-3 py-2'

                return (
                  <Link
                    key={tag.slug}
                    href={`/tag/${tag.slug}`}
                    className={`inline-flex items-center gap-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-full font-medium transition-all hover:scale-105 ${sizeClass}`}
                  >
                    <Tag className="w-3 h-3" />
                    {tag.name}
                    <span className="text-xs opacity-70 bg-background/20 rounded-full px-2 py-0.5">
                      {tag.count}
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="mt-16 pt-8 border-t text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">
                {tags.length}
              </div>
              <div className="text-sm text-muted-foreground">Total Tags</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">
                {tags.reduce((sum, tag) => sum + tag.count, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Posts</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">
                {Math.round(
                  tags.reduce((sum, tag) => sum + tag.count, 0) / tags.length
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                Avg Posts per Tag
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
