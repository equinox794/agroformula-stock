'use client'

import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

export function Navbar() {
  const { t } = useTranslation('common')

  return (
    <header className="border-b border-border bg-bg/95 backdrop-blur supports-[backdrop-filter]:bg-bg/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="text-2xl font-bold text-text">{t('navbar.logo')}</span>
          </Link>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <Link href="/sign-in">
              <Button variant="outline" size="sm">
                {t('navbar.login')}
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm">
                {t('navbar.signup')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
