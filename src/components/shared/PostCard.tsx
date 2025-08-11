import Link from 'next/link'

import { ArrowRight, BookOpen, Calendar } from 'lucide-react'

import { HeroImage } from '@/components/HeroImage'
import {
  getCardVariantClasses,
  getColorfulTagClass,
  getTagClasses,
  truncateText,
} from '@/lib/ui/component-utils'
import { getFallbackGradient } from '@/lib/ui/fallback-images'
import { cn, formatPostDate, slugify } from '@/lib/utils'
import { NotionPost } from '@/types/notion'

interface PostCardProps {
  post: NotionPost
  excerpt?: string
  variant?: 'default' | 'minimal' | 'featured' | 'compact'
  className?: string
  showExcerpt?: boolean
  showTags?: boolean
  maxTags?: number
  showCategory?: boolean
  priority?: boolean
}

export function PostCard({
  post,
  excerpt,
  variant = 'default',
  className = '',
  showExcerpt = true,
  showTags = true,
  maxTags = 3,
  showCategory = true,
  priority = false,
}: PostCardProps) {
  const formattedDate = formatPostDate(post.created_time)
  const variantClasses = getCardVariantClasses(variant)
  const gradientClasses = getFallbackGradient(post.title, post.category)

  // Render hero image if available and not minimal variant
  const shouldShowHeroImage = post.coverImage && variant !== 'minimal'

  if (variant === 'minimal') {
    return (
      <article className={cn(variantClasses.container, className)}>
        <Link href={`/${post.url_path}`} className="block">
          <div className={variantClasses.content}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-1">
                <h3 className={variantClasses.title}>{post.title}</h3>
                {showExcerpt && excerpt && (
                  <p className={variantClasses.excerpt}>{excerpt}</p>
                )}
              </div>
              <time
                dateTime={post.created_time}
                className="text-xs text-muted-foreground whitespace-nowrap"
              >
                {formattedDate}
              </time>
            </div>

            {showTags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {post.tags.slice(0, 2).map(tag => (
                  <Link
                    key={tag}
                    href={`/tag/${slugify(tag)}`}
                    className={getTagClasses('compact')}
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </Link>
      </article>
    )
  }

  if (variant === 'featured') {
    return (
      <article className={cn(variantClasses.container, className)}>
        <Link href={`/${post.url_path}`} className="block">
          {shouldShowHeroImage ? (
            <HeroImage
              coverImage={post.coverImage}
              title={post.title}
              createdAt={post.created_time}
              postId={post.id}
              category={post.category}
              priority={priority}
              className="h-48"
            />
          ) : (
            <div
              className={cn('h-24 bg-gradient-to-br relative', gradientClasses)}
            >
              <div className="absolute inset-0 bg-black/20" />
              {post.category && showCategory && (
                <div className="absolute top-4 left-4">
                  <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded-full">
                    {post.category}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className={variantClasses.content}>
            <div className="space-y-3">
              <h2 className={variantClasses.title}>{post.title}</h2>

              {showExcerpt && excerpt && (
                <p className={variantClasses.excerpt}>
                  {truncateText(excerpt, 200)}
                </p>
              )}
            </div>

            {showTags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {post.tags.slice(0, 4).map((tag, index) => (
                  <Link
                    key={tag}
                    href={`/tag/${slugify(tag)}`}
                    className={cn(
                      getTagClasses('colorful'),
                      getColorfulTagClass(index)
                    )}
                  >
                    {tag}
                  </Link>
                ))}
                {post.tags.length > 4 && (
                  <span className={getTagClasses('default')}>
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

  if (variant === 'compact') {
    return (
      <article className={cn(variantClasses.container, className)}>
        <Link href={`/${post.url_path}`} className="block">
          <div className={variantClasses.content}>
            {shouldShowHeroImage && (
              <div className="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0">
                <HeroImage
                  coverImage={post.coverImage}
                  title={post.title}
                  createdAt={post.created_time}
                  postId={post.id}
                  category={post.category}
                  showOverlay={false}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className={variantClasses.title}>{post.title}</h3>
                {post.category && showCategory && (
                  <span className="inline-block px-2 py-1 bg-secondary text-secondary-foreground text-xs font-medium rounded shrink-0">
                    {post.category}
                  </span>
                )}
              </div>

              {showExcerpt && excerpt && (
                <p className={variantClasses.excerpt}>
                  {truncateText(excerpt, 120)}
                </p>
              )}

              <div className="flex items-center justify-between">
                <time
                  dateTime={post.created_time}
                  className="text-xs text-muted-foreground"
                >
                  {formattedDate}
                </time>

                {showTags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {post.tags.slice(0, 2).map(tag => (
                      <Link
                        key={tag}
                        href={`/tag/${slugify(tag)}`}
                        className={getTagClasses('compact')}
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Link>
      </article>
    )
  }

  // Default variant
  return (
    <article className={cn(variantClasses.container, className)}>
      <Link href={`/${post.url_path}`} className="block">
        {/* Subtle gradient top accent */}
        <div className={cn('h-1 bg-gradient-to-r', gradientClasses)} />

        <div className={variantClasses.content}>
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <h2 className={cn(variantClasses.title, 'flex-1')}>
                {post.title}
              </h2>
              {post.category && showCategory && (
                <span className="inline-block px-2 py-1 bg-secondary text-secondary-foreground text-xs font-medium rounded shrink-0">
                  {post.category}
                </span>
              )}
            </div>

            {showExcerpt && excerpt && (
              <p className={variantClasses.excerpt}>
                {truncateText(excerpt, 180)}
              </p>
            )}
          </div>

          {showTags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {post.tags.slice(0, maxTags).map(tag => (
                <Link
                  key={tag}
                  href={`/tag/${slugify(tag)}`}
                  className={getTagClasses('default')}
                >
                  {tag}
                </Link>
              ))}
              {post.tags.length > maxTags && (
                <span className={getTagClasses('default')}>
                  +{post.tags.length - maxTags} more
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
