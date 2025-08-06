import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  getPostsByCategory,
  getAllCategories,
  generateExcerpt,
} from '@/lib/notion'
import { PostCard } from '@/components/post-card'
import { PostCardWithHero } from '@/components/PostCardWithHero'
import { OptimizedPostGrid } from '@/components/layout/OptimizedPostGrid'
import { Folder, Calendar, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface CategoryPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  const categories = await getAllCategories()
  return categories.map(category => ({
    slug: category.slug,
  }))
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const categories = await getAllCategories()
  const category = categories.find(c => c.slug === slug)

  if (!category) {
    return {
      title: 'Category Not Found',
    }
  }

  return {
    title: `${category.name} Posts`,
    description: `Browse all posts in the ${category.name} category. ${category.count} posts available.`,
    openGraph: {
      title: `${category.name} Posts`,
      description: `Browse all posts in the ${category.name} category. ${category.count} posts available.`,
    },
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params
  const categories = await getAllCategories()
  const category = categories.find(c => c.slug === slug)

  if (!category) {
    notFound()
  }

  const posts = await getPostsByCategory(category.name)

  if (posts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to all categories
          </Link>

          <div className="text-center py-16">
            <Folder className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h1 className="text-3xl font-bold mb-4">No posts found</h1>
            <p className="text-muted-foreground mb-8">
              There are no published posts in the &quot;{category.name}&quot;
              category yet.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Browse all posts
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Generate excerpts for posts
  const postsWithExcerpts = await Promise.all(
    posts.map(async post => ({
      post,
      excerpt: await generateExcerpt(post.id),
    }))
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to all categories
          </Link>

          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Folder className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">{category.name}</h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {category.count} {category.count === 1 ? 'post' : 'posts'}
              </p>
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="space-y-8">
          {/* Featured post */}
          {postsWithExcerpts.length > 0 && (
            <div className="mb-12">
              {postsWithExcerpts[0].post.coverImage ? (
                <PostCardWithHero
                  post={postsWithExcerpts[0].post}
                  excerpt={postsWithExcerpts[0].excerpt}
                  variant="featured"
                />
              ) : (
                <PostCard
                  post={postsWithExcerpts[0].post}
                  excerpt={postsWithExcerpts[0].excerpt}
                  variant="featured"
                />
              )}
            </div>
          )}

          {/* Remaining posts */}
          {postsWithExcerpts.length > 1 && (
            <OptimizedPostGrid
              posts={postsWithExcerpts.slice(1).map(({ post, excerpt }) => ({ ...post, excerpt }))}
              layout="grid"
              columns={3}
              animate={true}
              showExcerpts={true}
              showTags={true}
              showCategories={true}
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            />
          )}
        </div>

        {/* Related Categories */}
        <div className="mt-16 pt-8 border-t">
          <h2 className="text-2xl font-bold mb-6">Explore Other Categories</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories
              .filter(c => c.slug !== slug)
              .slice(0, 6)
              .map(relatedCategory => (
                <Link
                  key={relatedCategory.slug}
                  href={`/category/${relatedCategory.slug}`}
                  className="group p-4 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <Folder className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold group-hover:text-primary transition-colors">
                        {relatedCategory.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {relatedCategory.count}{' '}
                        {relatedCategory.count === 1 ? 'post' : 'posts'}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
