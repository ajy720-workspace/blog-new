import { Suspense } from 'react'
import { getPosts } from '@/lib/notion'
import {
  PersonalInfoSection,
  DEFAULT_PERSONAL_INFO,
} from '@/components/personal-info'
import { PostCard } from '@/components/post-card'

async function PostList() {
  try {
    const posts = await getPosts()

    if (posts.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No posts found. Create your first post in Notion!
          </p>
        </div>
      )
    }

    return (
      <div className="grid gap-6">
        {posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    )
  } catch {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Unable to load posts. Please check your Notion configuration.
        </p>
      </div>
    )
  }
}

function PostListSkeleton() {
  return (
    <div className="grid gap-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="border rounded-lg p-6 animate-pulse">
          <div className="space-y-3">
            <div className="h-6 bg-muted rounded w-3/4"></div>
            <div className="flex gap-4">
              <div className="h-4 bg-muted rounded w-24"></div>
              <div className="h-4 bg-muted rounded w-16"></div>
            </div>
            <div className="flex gap-2">
              <div className="h-5 bg-muted rounded w-12"></div>
              <div className="h-5 bg-muted rounded w-16"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <PersonalInfoSection info={DEFAULT_PERSONAL_INFO} />

      <section>
        <h2 className="text-2xl font-bold mb-8">Recent Posts</h2>
        <Suspense fallback={<PostListSkeleton />}>
          <PostList />
        </Suspense>
      </section>
    </main>
  )
}
