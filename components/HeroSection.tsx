'use client'

import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Package, Warehouse, BarChart3, Shield, Users, CreditCard } from 'lucide-react'

export function HeroSection() {
  const { t } = useTranslation('common')

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background gradient animation */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 animate-pulse" />
      
      <div className="container mx-auto px-4 relative">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main title with fade-in animation */}
          <h1 className="text-5xl md:text-6xl font-bold text-text mb-6 animate-fade-in">
            {t('hero.title')}
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-text-muted mb-4 max-w-3xl mx-auto">
            {t('hero.subtitle')}
          </p>
          
          {/* Description */}
          <p className="text-lg text-text-muted mb-8 max-w-2xl mx-auto">
            {t('hero.description')}
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up">
              <Button size="lg" className="w-full sm:w-auto">
                {t('hero.startNow')}
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                {t('hero.demoLogin')}
              </Button>
            </Link>
          </div>
        </div>

        {/* Features preview */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          <div className="flex flex-col items-center text-center p-4 rounded-lg bg-panel/50">
            <Package className="h-8 w-8 text-primary mb-2" />
            <span className="text-sm text-text-muted">{t('features.multiWarehouse.title')}</span>
          </div>
          <div className="flex flex-col items-center text-center p-4 rounded-lg bg-panel/50">
            <Warehouse className="h-8 w-8 text-primary mb-2" />
            <span className="text-sm text-text-muted">{t('features.warehouseManagement.title')}</span>
          </div>
          <div className="flex flex-col items-center text-center p-4 rounded-lg bg-panel/50">
            <BarChart3 className="h-8 w-8 text-primary mb-2" />
            <span className="text-sm text-text-muted">{t('features.advancedReports.title')}</span>
          </div>
          <div className="flex flex-col items-center text-center p-4 rounded-lg bg-panel/50">
            <Shield className="h-8 w-8 text-primary mb-2" />
            <span className="text-sm text-text-muted">{t('features.secureAccess.title')}</span>
          </div>
          <div className="flex flex-col items-center text-center p-4 rounded-lg bg-panel/50">
            <Users className="h-8 w-8 text-primary mb-2" />
            <span className="text-sm text-text-muted">{t('features.teamManagement.title')}</span>
          </div>
          <div className="flex flex-col items-center text-center p-4 rounded-lg bg-panel/50">
            <CreditCard className="h-8 w-8 text-primary mb-2" />
            <span className="text-sm text-text-muted">{t('features.stripeIntegration.title')}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
