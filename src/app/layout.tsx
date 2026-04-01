import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Tailscale Dashboard',
  description: 'Monitor your Tailscale tailnet',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📊</text></svg>" />
      </head>
      <body className="font-sans antialiased">
        <div className="min-h-screen bg-background-base">
          {children}
        </div>
      </body>
    </html>
  )
}
