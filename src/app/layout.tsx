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
} from '@/lib/seo'

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
    default: 'Blog - Personal Tech Blog',
    template: '%s | Blog',
  },
  description:
    'Personal blog about technology, programming, and web development. Built with Next.js and Notion.',
  keywords: [
    'blog',
    'technology',
    'programming',
    'web development',
    'Next.js',
    'React',
  ],
  authors: [{ name: 'Blog Author' }],
  creator: 'Blog Author',
  publisher: 'Blog',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'
  ),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: getCanonicalUrl('/'),
    title: 'Blog - Personal Tech Blog',
    description:
      'Personal blog about technology, programming, and web development. Built with Next.js and Notion.',
    siteName: 'Blog',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog - Personal Tech Blog',
    description:
      'Personal blog about technology, programming, and web development. Built with Next.js and Notion.',
    creator: '@yourusername',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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
