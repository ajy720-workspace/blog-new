import { Suspense } from 'react'
import Link from 'next/link'
import { getPostsWithMetadata, generateExcerpt } from '@/lib/notion'
import {
  PersonalInfoSection,
  DEFAULT_PERSONAL_INFO,
} from '@/components/personal-info'
import { PostCard } from '@/components/shared/PostCard'
import { OptimizedPostGrid } from '@/components/layout/OptimizedPostGrid'
import { StaggeredList } from '@/components/animations/StaggeredList'
import { LazyTagCloud } from '@/components/LazyComponents'
import { FadeIn } from '@/components/animations/FadeIn'

async function HomeContent() {
  try {
    const { posts, tags, categories } = await getPostsWithMetadata()

    if (posts.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No posts found. Create your first post in Notion!
          </p>
        </div>
      )
    }

    // Get excerpts for recent posts (first 6)
    const recentPosts = posts.slice(0, 6)
    const postsWithExcerpts = await Promise.all(
      recentPosts.map(async post => {
        const excerpt = await generateExcerpt(post.id, 150)
        return { ...post, excerpt }
      })
    )

    const featuredPost = postsWithExcerpts[0]
    const otherPosts = postsWithExcerpts.slice(1, 5)

    return (
      <div className="space-y-12">
        {/* Featured Post */}
        {featuredPost && (
          <section>
            <FadeIn>
              <h2 className="text-2xl font-bold mb-6">Featured Post</h2>
              <PostCard
                post={featuredPost}
                excerpt={featuredPost.excerpt}
                variant="featured"
                priority
              />
            </FadeIn>
          </section>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Posts */}
          <section className="lg:col-span-2">
            <FadeIn delay={200}>
              <h2 className="text-2xl font-bold mb-6">Recent Posts</h2>
            </FadeIn>

            <OptimizedPostGrid
              posts={otherPosts}
              layout="list"
              animate={true}
              showExcerpts={true}
              showTags={true}
              showCategories={true}
              className="space-y-6"
            />
          </section>

          {/* Sidebar */}
          <aside className="space-y-8">
            {/* Popular Tags */}
            <FadeIn delay={400}>
              <Suspense fallback={
                <div className="bg-card border rounded-lg p-6 animate-pulse">
                  <div className="h-6 bg-muted rounded w-32 mb-4"></div>
                  <div className="flex flex-wrap gap-2">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="h-8 bg-muted rounded w-16"></div>
                    ))}
                  </div>
                </div>
              }>
                <LazyTagCloud
                  tags={tags.slice(0, 15)}
                  maxTags={15}
                  variant="colorful"
                  className="bg-card border rounded-lg p-6"
                />
              </Suspense>
            </FadeIn>

            {/* Categories Quick Links */}
            {categories.length > 0 && (
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
                        <span className="text-sm font-medium">
                          {category.name}
                        </span>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                          {category.count}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </FadeIn>
            )}
          </aside>
        </div>

        {/* Show More Link */}
        {posts.length > 5 && (
          <section className="text-center">
            <FadeIn delay={600}>
              <Link
                href="/posts"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                View All Posts
                <span>→</span>
              </Link>
            </FadeIn>
          </section>
        )}
      </div>
    )
  } catch (error) {
    console.error('Error loading home content:', error)
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Unable to load posts. Please check your Notion configuration.
        </p>
      </div>
    )
  }
}

function HomeContentSkeleton() {
  return (
    <div className="space-y-12">
      {/* Featured Post Skeleton */}
      <section>
        <div className="h-8 bg-muted rounded w-48 mb-6"></div>
        <div className="border rounded-xl p-6 animate-pulse">
          <div className="h-24 bg-muted rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-8 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </div>
      </section>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Posts Skeleton */}
        <section className="lg:col-span-2">
          <div className="h-8 bg-muted rounded w-48 mb-6"></div>
          <div className="space-y-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="border rounded-lg p-6 animate-pulse">
                <div className="space-y-3">
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Sidebar Skeleton */}
        <aside className="space-y-8">
          <div className="bg-card border rounded-lg p-6 animate-pulse">
            <div className="h-6 bg-muted rounded w-32 mb-4"></div>
            <div className="flex flex-wrap gap-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-8 bg-muted rounded w-16"></div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <PersonalInfoSection info={DEFAULT_PERSONAL_INFO} />

      <Suspense fallback={<HomeContentSkeleton />}>
        <HomeContent />
      </Suspense>
    </main>
  )
}
