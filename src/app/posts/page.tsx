import { Suspense } from 'react'
import { Metadata } from 'next'
import { getPostsWithMetadata, generateExcerpt } from '@/lib/notion'
import { PostsContent } from './posts-content'
import { BreadcrumbNav } from '@/components/SEO/BreadcrumbNav'
import { FadeIn } from '@/components/animations/FadeIn'
import { PostCardSkeleton } from '@/components/ui/loading-states'

export const metadata: Metadata = {
  title: 'All Posts | Blog',
  description:
    'Browse and search through all blog posts. Find articles by category, tags, or search for specific topics.',
  openGraph: {
    title: 'All Posts | Blog',
    description:
      'Browse and search through all blog posts. Find articles by category, tags, or search for specific topics.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'All Posts | Blog',
    description:
      'Browse and search through all blog posts. Find articles by category, tags, or search for specific topics.',
  },
}

async function PostsData() {
  // Fetch all posts with metadata in a single call
  const { posts, tags, categories } = await getPostsWithMetadata()

  // Generate excerpts for all posts
  const postsWithExcerpts = await Promise.all(
    posts.map(async post => {
      const excerpt = await generateExcerpt(post.id, 150)
      return { ...post, excerpt }
    })
  )

  // Create excerpts map for search functionality
  const excerpts = new Map(
    postsWithExcerpts.map(post => [post.id, post.excerpt])
  )

  return (
    <PostsContent
      initialPosts={postsWithExcerpts}
      tags={tags}
      categories={categories}
      excerpts={excerpts}
    />
  )
}

function PostsPageSkeleton() {
  return (
    <div className="space-y-8">
      {/* Search Interface Skeleton */}
      <div className="space-y-4">
        <div className="h-10 bg-muted rounded-md animate-pulse" />
        <div className="flex flex-col sm:flex-row gap-4 sm:justify-between">
          <div className="flex gap-2">
            <div className="h-8 w-20 bg-muted rounded animate-pulse" />
            <div className="h-8 w-16 bg-muted rounded animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-32 bg-muted rounded animate-pulse" />
            <div className="h-8 w-24 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Results Skeleton */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 bg-muted rounded animate-pulse" />
          <div className="h-6 w-24 bg-muted rounded animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(9)].map((_, i) => (
            <PostCardSkeleton key={i} variant="default" />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function PostsPage() {
  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'All Posts', url: '/posts' },
  ]

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Breadcrumb Navigation */}
      <BreadcrumbNav items={breadcrumbItems} className="mb-6" />

      {/* Page Header */}
      <FadeIn>
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">All Posts</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover and explore all blog posts. Use the search and filters
            below to find exactly what you&apos;re looking for.
          </p>
        </header>
      </FadeIn>

      {/* Posts Content with Search */}
      <Suspense fallback={<PostsPageSkeleton />}>
        <PostsData />
      </Suspense>
    </main>
  )
}
