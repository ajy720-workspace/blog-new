import { Suspense } from 'react'

import Link from 'next/link'

import { LazyTagCloud } from '@/components/LazyComponents'
import { FadeIn } from '@/components/animations'
import { OptimizedPostGrid } from '@/components/layout/OptimizedPostGrid'
import {
  DEFAULT_PERSONAL_INFO,
  PersonalInfoSection,
} from '@/components/personal-info'
import { PostCard } from '@/components/shared/PostCard'
import {
  PostCardSkeleton,
  TagCloudSkeleton,
} from '@/components/ui/loading-states'
import { generateExcerpt, getPostsWithMetadata } from '@/lib/core/notion'

export const revalidate = 3600 // ISR: 1시간마다 재검증

async function FeaturedPostSection() {
  const { posts } = await getPostsWithMetadata()

  if (posts.length === 0) return null

  const featuredPost = posts[0]
  const excerpt = await generateExcerpt(featuredPost.id, 150)

  return (
    <section>
      <FadeIn>
        <h2 className="text-2xl font-bold mb-6">Featured Post</h2>
        <PostCard
          post={featuredPost}
          excerpt={excerpt}
          variant="featured"
          priority
        />
      </FadeIn>
    </section>
  )
}

async function RecentPostsSection() {
  const { posts } = await getPostsWithMetadata()

  if (posts.length <= 1) return null

  const recentPosts = posts.slice(1, 5)
  const postsWithExcerpts = await Promise.all(
    recentPosts.map(async post => {
      const excerpt = await generateExcerpt(post.id, 150)
      return { ...post, excerpt }
    })
  )

  return (
    <section className="lg:col-span-2">
      <FadeIn delay={200}>
        <h2 className="text-2xl font-bold mb-6">Recent Posts</h2>
      </FadeIn>
      <OptimizedPostGrid
        posts={postsWithExcerpts}
        layout="list"
        animate={true}
        showExcerpts={true}
        showTags={true}
        showCategories={true}
        className="space-y-6"
      />
    </section>
  )
}

async function TagCloudSection() {
  const { tags } = await getPostsWithMetadata()

  return (
    <FadeIn delay={400}>
      <LazyTagCloud
        tags={tags.slice(0, 15)}
        maxTags={15}
        variant="colorful"
        className="bg-card border rounded-lg p-6"
      />
    </FadeIn>
  )
}

async function CategoriesSection() {
  const { categories } = await getPostsWithMetadata()

  if (categories.length === 0) return null

  return (
    <FadeIn delay={500}>
      <div className="bg-card border rounded-lg p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <span>📂</span>
          Categories
        </h3>
        <div className="space-y-2">
          {categories.slice(0, 5).map(category => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              className="flex items-center justify-between p-2 rounded hover:bg-secondary transition-colors"
            >
              <span className="text-sm font-medium">{category.name}</span>
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                {category.count}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </FadeIn>
  )
}

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <PersonalInfoSection info={DEFAULT_PERSONAL_INFO} />

      <div className="space-y-12">
        {/* Featured Post */}
        <Suspense fallback={<PostCardSkeleton variant="featured" />}>
          <FeaturedPostSection />
        </Suspense>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Posts */}
          <Suspense
            fallback={
              <div className="lg:col-span-2">
                <div className="h-8 bg-muted rounded w-48 mb-6 animate-pulse"></div>
                <div className="space-y-6">
                  {[...Array(4)].map((_, i) => (
                    <PostCardSkeleton key={i} variant="default" />
                  ))}
                </div>
              </div>
            }
          >
            <RecentPostsSection />
          </Suspense>

          {/* Sidebar */}
          <aside className="space-y-8">
            {/* Popular Tags */}
            <Suspense fallback={<TagCloudSkeleton maxTags={15} />}>
              <TagCloudSection />
            </Suspense>

            {/* Categories Quick Links */}
            <Suspense
              fallback={
                <div className="bg-card border rounded-lg p-6 animate-pulse">
                  <div className="h-6 bg-muted rounded w-32 mb-4"></div>
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2"
                      >
                        <div className="h-4 bg-muted rounded w-24"></div>
                        <div className="h-5 bg-muted rounded w-8"></div>
                      </div>
                    ))}
                  </div>
                </div>
              }
            >
              <CategoriesSection />
            </Suspense>
          </aside>
        </div>

        {/* Show More Link - static content, no need for Suspense */}
        <section className="text-center">
          <FadeIn delay={600}>
            <Link
              href="/posts"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              View All Posts
              <span>→</span>
            </Link>
          </FadeIn>
        </section>
      </div>
    </main>
  )
}
