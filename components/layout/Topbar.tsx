'use client'

import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { Bell, User } from 'lucide-react'

export function Topbar() {
  const { t } = useTranslation('common')

  return (
    <header className="bg-panel border-b border-border p-4">
      <div className="flex items-center justify-end">
        <div className="flex items-center space-x-4">
          <LanguageSwitcher />
          <Button variant="ghost" size="sm">
            <Bell className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <span className="text-text">Admin</span>
          </div>
        </div>
      </div>
    </header>
  )
}