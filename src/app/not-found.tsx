import Link from 'next/link'

import { FileQuestion, Home } from 'lucide-react'

import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <main className="container mx-auto px-4 py-16">
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <FileQuestion className="w-16 h-16 text-muted-foreground mb-6" />
        <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-md">
          The page you&apos;re looking for doesn&apos;t exist. It might have
          been moved, deleted, or you entered the wrong URL.
        </p>
        <Button asChild>
          <Link href="/" className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            Go back home
          </Link>
        </Button>
      </div>
    </main>
  )
}
