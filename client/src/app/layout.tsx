import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '../components/theme-provider'

export const metadata: Metadata = {
  title: 'Gestion Laboratorios',
  description: 'Intento de proyecto final',
  generator: 'nosotros',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">

      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
