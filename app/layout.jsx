import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

const url = 'https://grouphub.thecloverforge.com'

export const metadata = {
  title: 'GroupHub - Find Your Team, Build Your Vision',
  description: 'Connect with skilled team members or find projects to contribute to. GroupHub helps students and professionals collaborate on ideas that matter.',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon.svg', type: 'image/svg+xml', sizes: 'any' },
      { url: '/favicon-96x96.png', type: 'image/png', sizes: '96x96' },
    ],
    apple: { url: '/apple-touch-icon.png' },
  },
  manifest: '/site.webmanifest',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  robots: { index: true, follow: true },
  openGraph: {
    title: 'GroupHub - Find Your Team, Build Your Vision',
    description: 'Connect with skilled team members or find projects to contribute to.',
    url,
    siteName: 'GroupHub',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GroupHub - Find Your Team, Build Your Vision',
    description: 'Connect with skilled team members or find projects to contribute to.',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="bg-background">
      <body className="font-sans antialiased min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
