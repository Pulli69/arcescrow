import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { TopNavbar } from '@/components/top-navbar'
import { WalletProvider } from '@/providers/wallet-provider'
import { CreateTaskProvider } from '@/providers/create-task-provider'
import './globals.css'

const geistSans = Geist({
  subsets: ["latin"],
  variable: '--font-geist-sans',
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: 'ArcEscrow | Secure Web3 Escrow',
  description: 'Trustless payments powered by proof. Pay only when delivery is verified on-chain.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#1a1625',
  colorScheme: 'dark',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark bg-background">
      <body suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <WalletProvider>
          <CreateTaskProvider>
            <SidebarProvider defaultOpen>
              <AppSidebar />
              <SidebarInset className="bg-background">
                <TopNavbar />
                <main className="flex-1 p-4 md:p-6 lg:p-8">
                  {children}
                </main>
              </SidebarInset>
            </SidebarProvider>
          </CreateTaskProvider>
        </WalletProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
