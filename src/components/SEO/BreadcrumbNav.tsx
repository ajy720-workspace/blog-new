import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { generateBreadcrumbSchema, BreadcrumbItem } from '@/lib/seo'
import { StructuredData } from './StructuredData'

interface BreadcrumbNavProps {
  items: BreadcrumbItem[]
  className?: string
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
            {index > 0 && (
              <ChevronRight className="w-4 h-4 mx-2" />
            )}
            {index === 0 && (
              <Home className="w-4 h-4 mr-2" />
            )}
            {index === items.length - 1 ? (
              <span 
                className="font-medium text-foreground"
                aria-current="page"
              >
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