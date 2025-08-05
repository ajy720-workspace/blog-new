import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

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
  title: 'Blog',
  description: 'Personal blog built with Next.js and Notion',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${pretendard.variable} ${robotoMono.variable} font-pretendard antialiased`}
      >
        <ThemeProvider>
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
