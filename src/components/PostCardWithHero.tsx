'use client'

import Link from 'next/link'
import { Calendar, ArrowRight } from 'lucide-react'
import { NotionPost } from '@/types/notion'
import { CompactHeroImage } from './HeroImage'
import { cn } from '@/lib/utils'

interface PostCardWithHeroProps {
  post: NotionPost
  excerpt?: string
  variant?: 'default' | 'featured' | 'compact'
  className?: string
}

export function PostCardWithHero({
  post,
  excerpt,
  variant = 'default',
  className = '',
}: PostCardWithHeroProps) {
  const formattedDate = new Date(post.created_time).toLocaleDateString(
    'en-US',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
  )

  const cardClasses = {
    default: 'h-full',
    featured: 'h-full md:flex-row md:h-80',
    compact: 'h-full',
  }

  const imageClasses = {
    default: 'h-48',
    featured: 'h-48 md:h-full md:w-1/2',
    compact: 'h-32',
  }

  const contentClasses = {
    default: 'p-6',
    featured: 'p-6 md:w-1/2 md:flex md:flex-col md:justify-between',
    compact: 'p-4',
  }

  return (
    <article
      className={cn(
        'group bg-card border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col',
        cardClasses[variant],
        className
      )}
    >
      <Link href={`/${post.url_path}`} className="flex flex-col h-full">
        {/* Hero Image */}
        <div className={cn('relative overflow-hidden', imageClasses[variant])}>
          <CompactHeroImage
            coverImage={post.coverImage}
            title={post.title}
            postId={post.id}
            category={post.category}
            aspectRatio={variant === 'compact' ? 'wide' : 'video'}
            className="h-full"
          />

          {/* Category Badge */}
          {post.category && (
            <div className="absolute top-3 left-3">
              <span className="inline-block px-3 py-1 bg-black/70 backdrop-blur-sm text-white text-xs font-medium rounded-full">
                {post.category}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className={cn('flex flex-col flex-grow', contentClasses[variant])}>
          <div className="flex-grow space-y-3">
            <h2
              className={cn(
                'font-bold group-hover:text-primary transition-colors line-clamp-2',
                variant === 'featured' ? 'text-2xl' : 'text-xl',
                variant === 'compact' ? 'text-lg' : ''
              )}
            >
              {post.title}
            </h2>

            {excerpt && (
              <p
                className={cn(
                  'text-muted-foreground line-clamp-3',
                  variant === 'compact' ? 'text-sm line-clamp-2' : ''
                )}
              >
                {excerpt}
              </p>
            )}

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.slice(0, variant === 'compact' ? 2 : 3).map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                  >
                    {tag}
                  </span>
                ))}
                {post.tags.length > (variant === 'compact' ? 2 : 3) && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                    +{post.tags.length - (variant === 'compact' ? 2 : 3)} more
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 mt-auto">
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

// Grid layout variant for hero cards
export function PostCardGrid({
  posts,
  excerpts = {},
  className = '',
}: {
  posts: NotionPost[]
  excerpts?: Record<string, string>
  className?: string
}) {
  return (
    <div
      className={cn(
        'grid gap-6 md:gap-8',
        'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        className
      )}
    >
      {posts.map((post, index) => (
        <PostCardWithHero
          key={post.id}
          post={post}
          excerpt={excerpts[post.id]}
          variant={index === 0 ? 'featured' : 'default'}
          className={index === 0 ? 'md:col-span-2 lg:col-span-3' : ''}
        />
      ))}
    </div>
  )
}
