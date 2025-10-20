'use client'

import { useTranslation } from 'react-i18next'
import { Navbar } from '@/components/Navbar'
import { HeroSection } from '@/components/HeroSection'
import { Footer } from '@/components/Footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, Warehouse, BarChart3, Shield, Users, CreditCard } from 'lucide-react'

export default function HomePage() {
  const { t } = useTranslation('common')

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <HeroSection />
      
      {/* Features Section */}
      <section className="py-20 bg-panel/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-text mb-12">
            {t('features.title')}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Package className="h-12 w-12 text-primary mb-4" />
                <CardTitle>{t('features.multiWarehouse.title')}</CardTitle>
                <CardDescription>
                  {t('features.multiWarehouse.description')}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Warehouse className="h-12 w-12 text-primary mb-4" />
                <CardTitle>{t('features.warehouseManagement.title')}</CardTitle>
                <CardDescription>
                  {t('features.warehouseManagement.description')}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-primary mb-4" />
                <CardTitle>{t('features.advancedReports.title')}</CardTitle>
                <CardDescription>
                  {t('features.advancedReports.description')}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-12 w-12 text-primary mb-4" />
                <CardTitle>{t('features.secureAccess.title')}</CardTitle>
                <CardDescription>
                  {t('features.secureAccess.description')}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-12 w-12 text-primary mb-4" />
                <CardTitle>{t('features.teamManagement.title')}</CardTitle>
                <CardDescription>
                  {t('features.teamManagement.description')}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CreditCard className="h-12 w-12 text-primary mb-4" />
                <CardTitle>{t('features.stripeIntegration.title')}</CardTitle>
                <CardDescription>
                  {t('features.stripeIntegration.description')}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-text mb-12">
            {t('pricing.title')}
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>{t('pricing.starter.title')}</CardTitle>
                <CardDescription>{t('pricing.starter.description')}</CardDescription>
                <div className="text-3xl font-bold text-text">
                  {t('pricing.starter.price')}
                  <span className="text-lg text-text-muted">{t('pricing.starter.period')}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-text-muted">
                  {t('pricing.starter.features', { returnObjects: true }).map((feature: string, index: number) => (
                    <li key={index}>• {feature}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-primary">
              <CardHeader>
                <CardTitle>{t('pricing.pro.title')}</CardTitle>
                <CardDescription>{t('pricing.pro.description')}</CardDescription>
                <div className="text-3xl font-bold text-text">
                  {t('pricing.pro.price')}
                  <span className="text-lg text-text-muted">{t('pricing.pro.period')}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-text-muted">
                  {t('pricing.pro.features', { returnObjects: true }).map((feature: string, index: number) => (
                    <li key={index}>• {feature}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('pricing.business.title')}</CardTitle>
                <CardDescription>{t('pricing.business.description')}</CardDescription>
                <div className="text-3xl font-bold text-text">
                  {t('pricing.business.price')}
                  <span className="text-lg text-text-muted">{t('pricing.business.period')}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-text-muted">
                  {t('pricing.business.features', { returnObjects: true }).map((feature: string, index: number) => (
                    <li key={index}>• {feature}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}