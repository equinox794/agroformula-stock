'use client'

import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  Package, 
  Factory, 
  ArrowUpDown, 
  BarChart3, 
  Settings,
  Home,
  Warehouse,
  Users,
  CreditCard
} from 'lucide-react'

export function Sidebar() {
  const { t } = useTranslation('common')
  const pathname = usePathname()

  const menuItems = [
    {
      href: '/dashboard',
      icon: Home,
      label: t('sidebar.home', 'Ana Sayfa'),
      active: pathname === '/dashboard'
    },
    {
      href: '/stock',
      icon: Package,
      label: t('sidebar.stock', 'Stok'),
      active: pathname.startsWith('/stock')
    },
    {
      href: '/dashboard/warehouses',
      icon: Warehouse,
      label: t('sidebar.warehouses', 'Depolar'),
      active: pathname.startsWith('/dashboard/warehouses')
    },
    {
      href: '/dashboard/products',
      icon: Package,
      label: t('sidebar.products', 'Ürünler'),
      active: pathname.startsWith('/dashboard/products')
    },
    {
      href: '/dashboard/team',
      icon: Users,
      label: t('sidebar.team', 'Ekip'),
      active: pathname.startsWith('/dashboard/team')
    },
    {
      href: '/dashboard/billing',
      icon: CreditCard,
      label: t('sidebar.billing', 'Faturalandırma'),
      active: pathname.startsWith('/dashboard/billing')
    },
    {
      href: '/dashboard/settings',
      icon: Settings,
      label: t('sidebar.settings', 'Ayarlar'),
      active: pathname.startsWith('/dashboard/settings')
    }
  ]

  return (
    <div className="w-64 bg-panel border-r border-border flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <Link href="/dashboard" className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <span className="text-xl font-bold text-text">AgroFormula</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href}>
              <Button 
                variant={item.active ? "default" : "ghost"} 
                className="w-full justify-start"
              >
                <Icon className="h-4 w-4 mr-2" />
                {item.label}
              </Button>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}