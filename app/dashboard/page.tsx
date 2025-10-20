'use client'

import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  AlertTriangle, 
  Package, 
  Factory, 
  ArrowUpDown, 
  BarChart3, 
  Settings,
  Search,
  Bell,
  User,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'

export default function DashboardPage() {
  const { t } = useTranslation('common')

  // Mock data - gerçek uygulamada Supabase'den gelecek
  const stats = {
    totalProducts: 156,
    totalWarehouses: 8,
    lowStockItems: 3,
    monthlyRevenue: 15750,
    monthlyGrowth: 12.5,
    activeOrders: 7,
    completedOrders: 23
  }

  const recentMovements = [
    { id: 1, date: '2024-01-15', product: 'Ammonium Nitrate', type: 'inbound', quantity: 500, warehouse: 'Ana Depo' },
    { id: 2, date: '2024-01-15', product: 'Potassium Chloride', type: 'outbound', quantity: 100, warehouse: 'Depo 2' },
    { id: 3, date: '2024-01-14', product: 'Urea', type: 'inbound', quantity: 300, warehouse: 'Ana Depo' },
    { id: 4, date: '2024-01-14', product: 'Ammonium Phosphate', type: 'outbound', quantity: 150, warehouse: 'Depo 1' },
    { id: 5, date: '2024-01-13', product: 'Ammonium Nitrate', type: 'inbound', quantity: 250, warehouse: 'Depo 3' }
  ]

  const productionOrders = [
    { id: 'ORD-2024-001', product: 'NPK 15-15-15', status: 'completed', quantity: 1000, priority: 'high' },
    { id: 'ORD-2024-002', product: 'NPK 20-10-10', status: 'in_progress', quantity: 500, priority: 'medium' },
    { id: 'ORD-2024-003', product: 'NPK 10-20-20', status: 'pending', quantity: 750, priority: 'low' },
    { id: 'ORD-2024-004', product: 'NPK 12-12-12', status: 'pending', quantity: 600, priority: 'medium' }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-500" />
      case 'pending': return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default: return <XCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500'
      case 'in_progress': return 'bg-blue-500'
      case 'pending': return 'bg-yellow-500'
      default: return 'bg-red-500'
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text">Dashboard</h1>
        <p className="text-text-muted">AgroFormula stok yönetim sistemine hoş geldiniz</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-muted">Toplam Ürün</p>
                <p className="text-2xl font-bold text-text">{stats.totalProducts}</p>
              </div>
              <Package className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-muted">Depo Sayısı</p>
                <p className="text-2xl font-bold text-text">{stats.totalWarehouses}</p>
              </div>
              <Factory className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-muted">Düşük Stok</p>
                <p className="text-2xl font-bold text-text">{stats.lowStockItems}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-muted">Aylık Gelir</p>
                <p className="text-2xl font-bold text-text">${stats.monthlyRevenue.toLocaleString()}</p>
                <div className="flex items-center text-sm text-green-500">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +{stats.monthlyGrowth}%
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alert */}
        <Card className="border-red-500 bg-red-500/10">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <CardTitle className="text-red-500">Düşük Stok Uyarısı</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-text-muted">Ammonium Nitrate: 200 kg (Eşik: 500 kg)</p>
              <p className="text-text-muted">Potassium Chloride: 150 kg (Eşik: 300 kg)</p>
              <p className="text-text-muted">Urea: 80 kg (Eşik: 200 kg)</p>
            </div>
            <Button variant="outline" size="sm" className="mt-3 w-full">
              Stok Güncelle
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Son Aktiviteler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentMovements.map((movement) => (
                <div key={movement.id} className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${movement.type === 'inbound' ? 'bg-green-500' : 'bg-orange-500'}`} />
                    <span className="text-sm text-text-muted">{movement.date}</span>
                  </div>
                  <div className="flex-1 mx-3">
                    <span className="text-sm font-medium">{movement.product}</span>
                    <p className="text-xs text-text-muted">{movement.warehouse}</p>
                  </div>
                  <Badge variant={movement.type === 'inbound' ? 'default' : 'secondary'} className={movement.type === 'inbound' ? 'bg-green-500' : 'bg-orange-500'}>
                    {movement.type === 'inbound' ? 'Giriş' : 'Çıkış'}
                  </Badge>
                  <span className="text-sm font-medium ml-2">{movement.quantity} kg</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Production Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Üretim Siparişleri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {productionOrders.map((order) => (
                <div key={order.id} className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(order.status)}
                    <span className="text-sm font-medium">{order.id}</span>
                  </div>
                  <div className="flex-1 mx-3">
                    <span className="text-sm">{order.product}</span>
                    <p className="text-xs text-text-muted">{order.quantity} kg</p>
                  </div>
                  <Badge variant="outline" className={getStatusColor(order.status)}>
                    {order.status === 'completed' ? 'Tamamlandı' : 
                     order.status === 'in_progress' ? 'Devam Ediyor' : 'Beklemede'}
                  </Badge>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="mt-3 w-full">
              Tüm Siparişleri Görüntüle
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Hızlı İşlemler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-20 flex flex-col">
                <Package className="h-6 w-6 mb-2" />
                <span className="text-sm">Yeni Ürün</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col">
                <Factory className="h-6 w-6 mb-2" />
                <span className="text-sm">Yeni Depo</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col">
                <ArrowUpDown className="h-6 w-6 mb-2" />
                <span className="text-sm">Stok Hareketi</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col">
                <BarChart3 className="h-6 w-6 mb-2" />
                <span className="text-sm">Raporlar</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}