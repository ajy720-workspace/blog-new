import { Suspense } from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  getPostsByCategory,
  getAllCategories,
  generateExcerpt,
  CategoryWithCount,
} from '@/lib/core/notion'
import { PostCard } from '@/components/post-card'
import { PostCardWithHero } from '@/components/PostCardWithHero'
import { OptimizedPostGrid } from '@/components/layout/OptimizedPostGrid'
import { BreadcrumbNav } from '@/components/SEO/BreadcrumbNav'
import {
  PostGridSkeleton,
  RelatedItemsSkeleton,
  PageHeaderSkeleton,
} from '@/components/ui/loading-states'
import { Folder, Calendar } from 'lucide-react'
import Link from 'next/link'
import { slugify } from '@/lib/utils/slug-utils'

export const revalidate = 3600 // ISR: 1시간마다 재검증

interface CategoryPageProps {
  params: Promise<{
    slug: string
  }>
}

// Helper function to find category with URL decoding and fallback logic
function findCategoryBySlug(
  categories: CategoryWithCount[],
  slug: string
): CategoryWithCount | undefined {
  // Try direct match first
  let category = categories.find(c => c.slug === slug)
  if (category) return category

  // Try URL decoded version
  try {
    const decodedSlug = decodeURIComponent(slug)
    category = categories.find(c => c.slug === decodedSlug)
    if (category) return category

    // Try slugified version of decoded slug
    const normalizedSlug = slugify(decodedSlug)
    category = categories.find(c => c.slug === normalizedSlug)
    if (category) return category
  } catch {
    // URL decoding failed, continue with other methods
  }

  // Try finding by name and then slugify
  category = categories.find(c => slugify(c.name) === slug)
  if (category) return category

  return undefined
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
  const category = findCategoryBySlug(categories, slug)

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

async function CategoryHeader({ slug }: { slug: string }) {
  const categories = await getAllCategories()
  const category = findCategoryBySlug(categories, slug)

  if (!category) {
    notFound()
  }

  return (
    <div className="mb-12">
      <BreadcrumbNav
        items={[
          { name: 'Home', url: '/' },
          { name: 'Categories', url: '/categories' },
          { name: category.name, url: `/category/${category.slug}` },
        ]}
        className="mb-6"
      />

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
  )
}

async function CategoryPosts({ slug }: { slug: string }) {
  const categories = await getAllCategories()
  const category = findCategoryBySlug(categories, slug)

  if (!category) {
    notFound()
  }

  const posts = await getPostsByCategory(category.name)

  if (posts.length === 0) {
    return (
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
          posts={postsWithExcerpts
            .slice(1)
            .map(({ post, excerpt }) => ({ ...post, excerpt }))}
        />
      )}
    </div>
  )
}

async function RelatedCategories({ currentSlug }: { currentSlug: string }) {
  const categories = await getAllCategories()

  return (
    <div className="mt-16 pt-8 border-t">
      <h2 className="text-2xl font-bold mb-6">Explore Other Categories</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories
          .filter(c => c.slug !== currentSlug)
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
  )
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <Suspense fallback={<PageHeaderSkeleton />}>
          <CategoryHeader slug={slug} />
        </Suspense>

        {/* Posts Grid */}
        <Suspense fallback={<PostGridSkeleton count={6} />}>
          <CategoryPosts slug={slug} />
        </Suspense>

        {/* Related Categories */}
        <Suspense fallback={<RelatedItemsSkeleton count={6} />}>
          <RelatedCategories currentSlug={slug} />
        </Suspense>
      </div>
    </div>
  )
}
