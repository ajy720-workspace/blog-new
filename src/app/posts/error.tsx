'use client'

import { useEffect } from 'react'

import Link from 'next/link'

import { AlertTriangle, Home, RefreshCw } from 'lucide-react'

import { AllPostBreadcrumbs } from '@/components/seo/BreadcrumbNav'
import { Button } from '@/components/ui/button'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function PostsError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Posts page error:', error)
  }, [error])

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Breadcrumb Navigation */}
      <AllPostBreadcrumbs className="mb-6" />

      {/* Page Header */}
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4">All Posts</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover and explore all blog posts. Use the search and filters below
          to find exactly what you&apos;re looking for.
        </p>
      </header>

      {/* Error Content */}
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Unable to load posts</h2>
            <p className="text-muted-foreground">
              We encountered an error while loading the posts. This might be a
              temporary issue with our content management system.
            </p>
          </div>

          <div className="space-y-3">
            <Button onClick={reset} className="w-full sm:w-auto">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try again
            </Button>

            <div className="text-sm text-muted-foreground">or</div>

            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Go back home
              </Link>
            </Button>
          </div>

          {/* Additional help text */}
          <div className="pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground">
              If this problem persists, please try refreshing the page or
              contact support.
              {error.digest && (
                <>
                  <br />
                  <span className="font-mono">Error ID: {error.digest}</span>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
