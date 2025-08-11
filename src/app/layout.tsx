import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { WebVitals } from '@/components/WebVitals'
import {
  generateWebSiteSchema,
  generateOrganizationSchema,
  getCanonicalUrl,
} from '@/lib/core/seo'
import { siteConfig } from '@/config/site.config'
import { seoConfig } from '@/config/seo.config'

const pretendard = localFont({
  src: './fonts/PretendardVariable.woff2',
  display: 'swap',
  variable: '--font-pretendard',
  weight: '45 920',
  fallback: ['var(--font-sans)'],
})

const robotoMono = localFont({
  src: './fonts/RobotoMono-VariableFont_wght.ttf',
  display: 'swap',
  variable: '--font-roboto-mono',
  weight: '100 700',
  fallback: ['var(--font-mono)'],
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
      <body
        className={`${pretendard.variable} ${robotoMono.variable} font-pretendard antialiased`}
      >
        <ThemeProvider>
          <WebVitals />
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
