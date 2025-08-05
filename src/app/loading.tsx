export default function Loading() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="animate-pulse">
        <div className="border-b pb-12 mb-12">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-muted rounded-full"></div>
            <div className="flex-1 space-y-4">
              <div>
                <div className="h-8 bg-muted rounded w-48 mb-2"></div>
                <div className="h-6 bg-muted rounded w-full mb-1"></div>
                <div className="h-6 bg-muted rounded w-3/4"></div>
              </div>
              <div className="flex gap-4">
                <div className="h-8 bg-muted rounded w-20"></div>
                <div className="h-8 bg-muted rounded w-20"></div>
                <div className="h-8 bg-muted rounded w-20"></div>
              </div>
            </div>
          </div>
        </div>

        <section>
          <div className="h-8 bg-muted rounded w-40 mb-8"></div>
          <div className="grid gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border rounded-lg p-6">
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
        </section>
      </div>
    </main>
  )
}
