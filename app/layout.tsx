import type { Metadata } from 'next'
import './globals.css'
import '../styles/theme.css'
import { I18nProvider } from '@/components/I18nProvider'

export const metadata: Metadata = {
  title: 'AgroFormula | Modern Stock SaaS',
  description: 'Modern stok yönetim SaaS uygulaması - Multi-warehouse, RBAC-enabled, Stripe integrated',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr" className="dark">
      <body className="font-sans antialiased">
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  )
}
