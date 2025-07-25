import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CTF Platform',
  description: 'Capture The Flag Competition Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}