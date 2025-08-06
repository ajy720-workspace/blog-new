import Link from 'next/link'
import { Calendar, ArrowRight, BookOpen } from 'lucide-react'
import { NotionPost } from '@/types/notion'
import { getFallbackGradient } from '@/lib/fallback-images'
import { cn } from '@/lib/utils'

interface PostCardProps {
  post: NotionPost
  excerpt?: string
  variant?: 'default' | 'minimal' | 'featured'
  className?: string
}

export function PostCard({
  post,
  excerpt,
  variant = 'default',
  className = '',
}: PostCardProps) {
  const formattedDate = new Date(post.created_time).toLocaleDateString(
    'en-US',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
  )

  const gradientClasses = getFallbackGradient(post.title, post.category)

  if (variant === 'minimal') {
    return (
      <article
        className={cn(
          'group py-4 border-b border-border last:border-b-0',
          className
        )}
      >
        <Link href={`/${post.url_path}`} className="block space-y-2">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-1">
              <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-2">
                {post.title}
              </h3>
              {excerpt && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {excerpt}
                </p>
              )}
            </div>
            <time
              dateTime={post.created_time}
              className="text-xs text-muted-foreground whitespace-nowrap"
            >
              {formattedDate}
            </time>
          </div>

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {post.tags.slice(0, 2).map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary/50 text-secondary-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </Link>
      </article>
    )
  }

  if (variant === 'featured') {
    return (
      <article
        className={cn(
          'group relative overflow-hidden rounded-xl border-2 border-border hover:border-primary/50 transition-all duration-300 bg-card',
          className
        )}
      >
        <Link href={`/${post.url_path}`} className="block">
          {/* Gradient header */}
          <div
            className={cn('h-24 bg-gradient-to-br relative', gradientClasses)}
          >
            <div className="absolute inset-0 bg-black/20" />
            {post.category && (
              <div className="absolute top-4 left-4">
                <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded-full">
                  {post.category}
                </span>
              </div>
            )}
          </div>

          <div className="p-6 space-y-4">
            <div className="space-y-3">
              <h2 className="text-2xl font-bold group-hover:text-primary transition-colors line-clamp-2">
                {post.title}
              </h2>

              {excerpt && (
                <p className="text-muted-foreground line-clamp-3 leading-relaxed">
                  {excerpt}
                </p>
              )}
            </div>

            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.slice(0, 4).map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                  >
                    {tag}
                  </span>
                ))}
                {post.tags.length > 4 && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-secondary text-secondary-foreground">
                    +{post.tags.length - 4} more
                  </span>
                )}
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <time dateTime={post.created_time}>{formattedDate}</time>
              </div>

              <div className="flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                <BookOpen className="w-4 h-4" />
                <span>Read article</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </Link>
      </article>
    )
  }

  // Default variant
  return (
    <article
      className={cn(
        'group bg-card border rounded-lg overflow-hidden hover:shadow-lg hover:border-primary/50 transition-all duration-300',
        className
      )}
    >
      <Link href={`/${post.url_path}`} className="block">
        {/* Subtle gradient top accent */}
        <div className={cn('h-1 bg-gradient-to-r', gradientClasses)} />

        <div className="p-6 space-y-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-2 flex-1">
                {post.title}
              </h2>
              {post.category && (
                <span className="inline-block px-2 py-1 bg-secondary text-secondary-foreground text-xs font-medium rounded shrink-0">
                  {post.category}
                </span>
              )}
            </div>

            {excerpt && (
              <p className="text-muted-foreground line-clamp-3 leading-relaxed">
                {excerpt}
              </p>
            )}
          </div>

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.slice(0, 3).map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                >
                  {tag}
                </span>
              ))}
              {post.tags.length > 3 && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                  +{post.tags.length - 3} more
                </span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <time dateTime={post.created_time}>{formattedDate}</time>
            </div>

            <div className="flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
              <span>Read more</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </Link>
    </article>
  )
}
