import Link from 'next/link'

import { ChevronRight, Home } from 'lucide-react'

import { BreadcrumbItem, generateBreadcrumbSchema } from '@/lib/core/seo'
import { slugify } from '@/lib/utils'
import { NotionPost } from '@/types/notion'

import { StructuredData } from './StructuredData'

interface BreadcrumbNavProps {
  items: BreadcrumbItem[]
  className?: string
}

export function AllPostBreadcrumbs({ className = '' }: { className?: string }) {
  const items: BreadcrumbItem[] = [
    { name: 'Home', url: '/' },
    { name: 'All Posts', url: '/posts' },
  ]

  return <BreadcrumbNav items={items} className={className} />
}
// Specialized breadcrumbs for blog posts
export function PostBreadcrumbs({
  post,
  className = '',
}: {
  post: NotionPost
  className?: string
}) {
  const items: BreadcrumbItem[] = [{ name: 'Home', url: '/' }]

  if (post.category) {
    items.push({
      name: post.category,
      url: `/category/${slugify(post.category)}`,
    })
  }

  items.push({
    name: post.title.length > 50 ? `${post.title.slice(0, 50)}...` : post.title,
    url: '',
  })

  return <BreadcrumbNav items={items} className={className} />
}

// Specialized breadcrumbs for tag pages
export function TagBreadcrumbs({
  tagName,
  className = '',
}: {
  tagName: string
  className?: string
}) {
  const items: BreadcrumbItem[] = [
    { name: 'Home', url: '/' },
    { name: 'Tags', url: '/tags' },
    { name: `#${tagName}`, url: '' },
  ]

  return <BreadcrumbNav items={items} className={className} />
}

// Specialized breadcrumbs for category pages
export function CategoryBreadcrumbs({
  categoryName,
  className = '',
}: {
  categoryName: string
  className?: string
}) {
  const items: BreadcrumbItem[] = [
    { name: 'Home', url: '/' },
    { name: 'Categories', url: '/categories' },
    { name: categoryName, url: '' },
  ]

  return <BreadcrumbNav items={items} className={className} />
}

export function BreadcrumbNav({ items, className = '' }: BreadcrumbNavProps) {
  const breadcrumbSchema = generateBreadcrumbSchema(items)

  return (
    <>
      <StructuredData data={breadcrumbSchema} />
      <nav
        aria-label="Breadcrumb"
        className={`flex items-center space-x-2 text-sm text-muted-foreground ${className}`}
      >
        {items.map((item, index) => (
          <div key={item.url} className="flex items-center">
            {index > 0 && <ChevronRight className="w-4 h-4 mr-2" />}
            {index === 0 && <Home className="w-4 h-4 mr-2" />}
            {index === items.length - 1 ? (
              <span className="font-medium text-foreground" aria-current="page">
                {item.name}
              </span>
            ) : (
              <Link
                href={item.url}
                className="hover:text-foreground transition-colors"
              >
                {item.name}
              </Link>
            )}
          </div>
        ))}
      </nav>
    </>
  )
}
