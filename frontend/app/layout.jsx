import { Archivo, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { Providers } from './providers'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

const archivo = Archivo({ subsets: ["latin"], variable: "--font-display" })
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata = {
  title: 'GroupHub - Find Your Team, Build Your Vision',
  description: 'Connect with skilled team members or find projects to contribute to. GroupHub helps students and professionals collaborate on ideas that matter.',
  icons: {
    icon: '/Logo.svg',
    apple: '/apple-icon.png',
  },
}

/** Root layout: fonts, providers, navbar, footer. */
export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${archivo.variable} ${inter.variable} bg-background`}>
      <body className="font-sans antialiased min-h-screen flex flex-col">
        <Providers>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </Providers>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
