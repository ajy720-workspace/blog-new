'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { ChevronRight, Home } from 'lucide-react'

import { cn, slugify } from '@/lib/utils'

interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ComponentType<{ className?: string }>
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[]
  className?: string
  showHome?: boolean
  separator?: React.ReactNode
}

export function Breadcrumbs({
  items,
  className = '',
  showHome = true,
  separator = <ChevronRight className="w-4 h-4 text-muted-foreground/60" />,
}: BreadcrumbsProps) {
  const pathname = usePathname()

  // Auto-generate breadcrumbs from pathname if items not provided
  const breadcrumbItems = items || generateBreadcrumbsFromPath(pathname)

  if (breadcrumbItems.length === 0) return null

  const allItems = showHome
    ? [{ label: 'Home', href: '/', icon: Home }, ...breadcrumbItems]
    : breadcrumbItems

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center space-x-2 text-sm', className)}
    >
      <ol className="flex items-center space-x-2">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1
          const Icon = item.icon

          return (
            <li key={index} className="flex items-center space-x-2">
              {index > 0 && (
                <span className="shrink-0" aria-hidden="true">
                  {separator}
                </span>
              )}

              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span
                  className={cn(
                    'flex items-center gap-1.5',
                    isLast
                      ? 'text-foreground font-medium'
                      : 'text-muted-foreground'
                  )}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  <span>{item.label}</span>
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

// Auto-generate breadcrumbs from pathname
function generateBreadcrumbsFromPath(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs: BreadcrumbItem[] = []

  segments.forEach((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/')
    const isLast = index === segments.length - 1

    // Capitalize and format segment
    const label = formatSegmentLabel(segment)

    breadcrumbs.push({
      label,
      href: isLast ? undefined : href,
    })
  })

  return breadcrumbs
}

function formatSegmentLabel(segment: string): string {
  // Handle specific route patterns
  const routeLabels: Record<string, string> = {
    tags: 'Tags',
    tag: 'Tag',
    categories: 'Categories',
    category: 'Category',
    auth: 'Authentication',
    about: 'About',
    contact: 'Contact',
  }

  if (routeLabels[segment]) {
    return routeLabels[segment]
  }

  // Convert kebab-case to title case
  return segment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Specialized breadcrumbs for blog posts
export function PostBreadcrumbs({
  postTitle,
  category,
  className = '',
}: {
  postTitle: string
  category?: string
  className?: string
}) {
  const items: BreadcrumbItem[] = []

  if (category) {
    items.push({
      label: category,
      href: `/category/${slugify(category)}`,
    })
  }

  items.push({
    label: postTitle.length > 50 ? `${postTitle.slice(0, 50)}...` : postTitle,
  })

  return <Breadcrumbs items={items} className={className} />
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
    { label: 'Tags', href: '/tags' },
    { label: `#${tagName}` },
  ]

  return <Breadcrumbs items={items} className={className} />
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
    { label: 'Categories', href: '/categories' },
    { label: categoryName },
  ]

  return <Breadcrumbs items={items} className={className} />
}

// Compact breadcrumbs for mobile
export function CompactBreadcrumbs({
  items,
  className = '',
  maxItems = 2,
}: BreadcrumbsProps & { maxItems?: number }) {
  const pathname = usePathname()
  const breadcrumbItems = items || generateBreadcrumbsFromPath(pathname)

  if (breadcrumbItems.length === 0) return null

  const displayItems =
    breadcrumbItems.length > maxItems
      ? [
          breadcrumbItems[0],
          { label: '...', href: undefined },
          ...breadcrumbItems.slice(-maxItems + 1),
        ]
      : breadcrumbItems

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center space-x-1 text-xs', className)}
    >
      <Link href="/" className="text-muted-foreground hover:text-foreground">
        <Home className="w-3 h-3" />
      </Link>

      {displayItems.map((item, index) => (
        <div key={index} className="flex items-center space-x-1">
          <ChevronRight className="w-3 h-3 text-muted-foreground/60" />

          {item.href ? (
            <Link
              href={item.href}
              className="text-muted-foreground hover:text-foreground truncate max-w-[100px]"
            >
              {item.label}
            </Link>
          ) : (
            <span
              className={cn(
                'truncate max-w-[100px]',
                index === displayItems.length - 1
                  ? 'text-foreground font-medium'
                  : 'text-muted-foreground'
              )}
            >
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  )
}
