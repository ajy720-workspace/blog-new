'use client'

import Image from 'next/image'

import { getFallbackGradient, getPostImageSrc } from '@/lib/ui/fallback-images'
import { cn } from '@/lib/utils'

export interface HeroImageProps {
  coverImage?: string
  title: string
  createdAt: string
  postId: string
  category?: string
  className?: string
  showOverlay?: boolean
  priority?: boolean
}

export function HeroImage({
  coverImage,
  title,
  createdAt,
  postId,
  category,
  className = '',
  showOverlay = true,
  priority = false,
}: HeroImageProps) {
  const { src, isFallback } = getPostImageSrc(coverImage, postId, category)
  const fallbackGradient = getFallbackGradient(title, category)

  // Format date for display
  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  if (isFallback && !coverImage) {
    // Render gradient fallback
    return (
      <div
        className={cn(
          'relative w-full h-64 md:h-80 lg:h-96 overflow-hidden rounded-lg',
          `bg-gradient-to-br ${fallbackGradient}`,
          className
        )}
      >
        {showOverlay && (
          <div className="absolute inset-0 bg-black/40 flex items-end">
            <div className="p-6 md:p-8 text-white">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 line-clamp-2">
                {title}
              </h1>
              <p className="text-sm md:text-base opacity-90">{formattedDate}</p>
              {category && (
                <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-xs md:text-sm font-medium">
                  {category}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'relative w-full h-64 md:h-80 lg:h-96 overflow-hidden rounded-lg',
        className
      )}
    >
      <Image
        src={src}
        alt={`Cover image for ${title}`}
        fill
        priority={priority}
        className="object-cover transition-transform duration-300 hover:scale-105"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
        onError={e => {
          // If image fails to load, show gradient fallback
          const target = e.target as HTMLImageElement
          target.style.display = 'none'
          if (target.parentElement) {
            target.parentElement.classList.add(
              'bg-gradient-to-br',
              ...fallbackGradient.split(' ')
            )
          }
        }}
      />
      {showOverlay && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end">
          <div className="p-6 md:p-8 text-white">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 line-clamp-2 drop-shadow-lg">
              {title}
            </h1>
            <p className="text-sm md:text-base opacity-90 drop-shadow-md">
              {formattedDate}
            </p>
            {category && (
              <span className="inline-block mt-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs md:text-sm font-medium">
                {category}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Variant for smaller hero images (e.g., in cards)
export interface CompactHeroImageProps {
  coverImage?: string
  title: string
  postId: string
  category?: string
  className?: string
  aspectRatio?: 'square' | 'video' | 'wide'
}

export function CompactHeroImage({
  coverImage,
  title,
  postId,
  category,
  className = '',
  aspectRatio = 'video',
}: CompactHeroImageProps) {
  const { src, isFallback } = getPostImageSrc(coverImage, postId, category)
  const fallbackGradient = getFallbackGradient(title, category)

  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[21/9]',
  }

  if (isFallback && !coverImage) {
    return (
      <div
        className={cn(
          'relative w-full overflow-hidden rounded-lg',
          aspectClasses[aspectRatio],
          `bg-gradient-to-br ${fallbackGradient}`,
          className
        )}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white p-4">
            <h3 className="font-semibold text-sm md:text-base line-clamp-2">
              {title}
            </h3>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-lg',
        aspectClasses[aspectRatio],
        className
      )}
    >
      <Image
        src={src}
        alt={`Cover image for ${title}`}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        onError={e => {
          const target = e.target as HTMLImageElement
          target.style.display = 'none'
          if (target.parentElement) {
            target.parentElement.classList.add(
              'bg-gradient-to-br',
              ...fallbackGradient.split(' ')
            )
          }
        }}
      />
    </div>
  )
}
