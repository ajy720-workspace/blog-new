import type { Metadata } from 'next'
import localFont from 'next/font/local'

import { GoogleAnalytics } from '@/components/analytics'
import { PageViewTracker } from '@/components/analytics'
import { WebVitals } from '@/components/analytics'
import { Footer } from '@/components/layout'
import { Header } from '@/components/layout'
import { ThemeProvider } from '@/components/theme'
import { BackToTop } from '@/components/ui/back-to-top'
import { seoConfig, siteConfig } from '@/config'
import {
  generateOrganizationSchema,
  generateWebSiteSchema,
  getCanonicalUrl,
} from '@/lib/core/seo'

import './globals.css'

const pretendard = localFont({
  src: './fonts/PretendardVariable.woff2',
  display: 'swap',
  variable: '--font-pretendard',
  weight: '45 920',
  fallback: ['var(--font-sans)'],
})

export const metadata: Metadata = {
  title: {
    default: seoConfig.defaultTitle,
    template: seoConfig.titleTemplate,
  },
  description: seoConfig.defaultDescription,
  keywords: seoConfig.defaultKeywords,
  authors: [{ name: siteConfig.author.name, url: siteConfig.url }],
  creator: siteConfig.metadata.creator,
  publisher: siteConfig.metadata.publisher,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: seoConfig.openGraph.type as 'website',
    locale: seoConfig.openGraph.locale,
    url: getCanonicalUrl('/'),
    title: seoConfig.defaultTitle,
    description: seoConfig.defaultDescription,
    siteName: seoConfig.openGraph.siteName,
    images: [{ url: seoConfig.openGraph.defaultCover }],
  },
  twitter: {
    card: 'summary_large_image',
    title: seoConfig.defaultTitle,
    description: seoConfig.defaultDescription,
  },
  robots: seoConfig.robots,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const webSiteSchema = generateWebSiteSchema()
  const organizationSchema = generateOrganizationSchema()

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(webSiteSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
      </head>
      <body className={`${pretendard.variable} font-pretendard antialiased`}>
        <ThemeProvider>
          <GoogleAnalytics />
          <PageViewTracker />
          <WebVitals />
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <div className="flex flex-1">
              {/* CategorySidebar 기능은 완성 / UI 도입 검토  */}
              {/* <aside className="hidden lg:block w-64 shrink-0 border-r border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="sticky top-20 p-6">
                  <AsyncCategorySidebar />
                </div>
              </aside> */}
              <main className="flex-1 min-w-0">{children}</main>
            </div>
            <Footer />
          </div>
          <BackToTop />
        </ThemeProvider>
      </body>
    </html>
  )
}
