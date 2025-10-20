'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, ChevronLeft, ChevronRight, Edit, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { ProductEditModal } from '@/components/ProductEditModal'
import { getProducts, deleteProduct } from '@/modules/product/server-actions'
import { useProductStore, Product } from '@/modules/product/store'

export default function StockPage() {
  const { t } = useTranslation('common')
  const { 
    products, 
    isLoading, 
    setProducts, 
    deleteProduct: removeProduct,
    setLoading 
  } = useProductStore()
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedWarehouse, setSelectedWarehouse] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [sortBy, setSortBy] = useState<'none' | 'value_desc' | 'value_asc' | 'stock_desc' | 'stock_asc'>('none')
  const [showCriticalOnly, setShowCriticalOnly] = useState(false)

  const warehouses = [
    { id: 'all', name: 'Tümü' },
    { id: '1', name: 'Ana Depo' },
    { id: '2', name: 'Yan Depo' },
    { id: '3', name: 'Soğuk Depo' }
  ]

  const productTypes = [
    { id: 'all', name: 'Tümü' },
    { id: 'Raw', name: 'Hammadde' },
    { id: 'Final', name: 'Hazır' },
    { id: 'SemiFinished', name: 'Ambalaj' }
  ]

  // Ürünleri yükle
  const loadProducts = async () => {
    setLoading(true)
    try {
      const result = await getProducts()
      if (result.success && result.data) {
        setProducts(result.data)
        console.log('✅ Supabase\'den veri yüklendi:', result.data.length, 'ürün')
      } else {
        console.error('❌ Ürünler yüklenemedi:', result.error)
        setProducts([])
      }
    } catch (error) {
      console.error('❌ Ürünler yüklenemedi:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const filteredProducts = products.filter(product => {
    const matchesSearch = searchTerm === '' ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(searchTerm.toLowerCase())
    
    const totalStock = product.stocks?.reduce((sum, s) => sum + s.quantity, 0) || 0
    const matchesCritical = !showCriticalOnly || (product.min_stock > 0 && totalStock < product.min_stock)
    
    const matchesType = selectedType === 'all' || product.type === selectedType

    return matchesSearch && matchesCritical && matchesType
  })

  // Sıralama uygula
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'none') return 0
    
    const aTotalStock = a.stocks?.reduce((sum, s) => sum + s.quantity, 0) || 0
    const bTotalStock = b.stocks?.reduce((sum, s) => sum + s.quantity, 0) || 0
    const aTotalValue = aTotalStock * a.kg_price
    const bTotalValue = bTotalStock * b.kg_price
    
    switch (sortBy) {
      case 'value_desc':
        return bTotalValue - aTotalValue
      case 'value_asc':
        return aTotalValue - bTotalValue
      case 'stock_desc':
        return bTotalStock - aTotalStock
      case 'stock_asc':
        return aTotalStock - bTotalStock
      default:
        return 0
    }
  })

  // Pagination (basit bir örnek)
  const [currentPage, setCurrentPage] = useState(1)
  const productsPerPage = 10
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage)
  const currentProducts = sortedProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  )

  // Ürün düzenle
  const handleEdit = (product: Product) => {
    setSelectedProduct(product)
    setIsEditModalOpen(true)
  }

  // Yeni ürün ekle
  const handleNewProduct = () => {
    setSelectedProduct(null)
    setIsEditModalOpen(true)
  }

  // Ürün sil
  const handleDelete = async (product: Product) => {
    if (confirm(`"${product.name}" ürününü silmek istediğinizden emin misiniz?`)) {
      try {
        const result = await deleteProduct(product.id)
        if (result.success) {
          // Store'dan da sil
          removeProduct(product.id)
        } else {
          alert('Ürün silinemedi: ' + result.error)
        }
      } catch (error) {
        alert('Ürün silinemedi: ' + error)
      }
    }
  }

  // Modal kapat
  const handleModalClose = () => {
    setIsEditModalOpen(false)
    setSelectedProduct(null)
  }

  // Başarılı işlem sonrası
  const handleSuccess = (newProduct?: Product) => {
    // Store zaten güncellendiği için tekrar yüklemeye gerek yok
    // Sadece modal'ı kapat
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-text">{t('stock')}</h1>
        <div className="flex items-center space-x-4">
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Stok Tipi" />
            </SelectTrigger>
            <SelectContent>
              {productTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Depo Seçimi" />
            </SelectTrigger>
            <SelectContent>
              {warehouses.map((warehouse) => (
                <SelectItem key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleNewProduct} className="bg-primary text-white">
            <Plus className="mr-2 h-4 w-4" />
            {t('new_product')}
          </Button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex items-center justify-between">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <Input
            placeholder={t('search_products')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-bg border-border text-text"
          />
        </div>
        <div className="flex items-center space-x-4">
          {/* Genel toplam TL */}
          <div className="text-sm text-text">
            Genel Toplam: {' '}
            {(() => {
              const total = sortedProducts.reduce((sum, p) => {
                const qty = p.stocks?.reduce((s, st) => s + st.quantity, 0) || 0
                return sum + qty * p.kg_price
              }, 0)
              return `₺${total.toLocaleString()}`
            })()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline" 
              size="sm" 
              className={`bg-panel border-border text-text ${sortBy === 'value_desc' ? 'bg-primary text-white' : ''}`}
              onClick={() => setSortBy(sortBy === 'value_desc' ? 'none' : 'value_desc')}
            >
              <ArrowDown className="mr-1 h-3 w-3" />
              Değer ↓
            </Button>
            <Button
              variant="outline" 
              size="sm" 
              className={`bg-panel border-border text-text ${sortBy === 'stock_desc' ? 'bg-primary text-white' : ''}`}
              onClick={() => setSortBy(sortBy === 'stock_desc' ? 'none' : 'stock_desc')}
            >
              <ArrowDown className="mr-1 h-3 w-3" />
              Stok ↓
            </Button>
            <Button
              variant="outline" 
              size="sm" 
              className={`bg-panel border-border text-text ${showCriticalOnly ? 'bg-red-500 text-white' : ''}`}
              onClick={() => setShowCriticalOnly(!showCriticalOnly)}
            >
              {t('critical_stock')}
            </Button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="text-text-muted">Yükleniyor...</div>
        </div>
      )}

      {/* Product Table */}
      {!isLoading && (
        <div className="bg-panel border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-panel border-b border-border">
              <TableRow className="hover:bg-panel">
                <TableHead className="text-text font-semibold">{t('product_code')}</TableHead>
                <TableHead className="text-text font-semibold">{t('product_name')}</TableHead>
                <TableHead className="text-text font-semibold">{t('type')}</TableHead>
                <TableHead className="text-text font-semibold">{t('unit')}</TableHead>
                <TableHead className="text-text font-semibold">{t('vat_rate')}</TableHead>
                <TableHead className="text-text font-semibold">{t('min_stock')}</TableHead>
                <TableHead className="text-text font-semibold">Toplam Stok</TableHead>
                <TableHead className="text-text font-semibold">{t('kg_price')}</TableHead>
                <TableHead className="text-text font-semibold">{t('total_tl')}</TableHead>
                <TableHead className="text-text font-semibold">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentProducts.map((product) => {
                // Kritik stok kontrolü
                const totalStock = product.stocks?.reduce((sum, stock) => sum + stock.quantity, 0) || 0
                const isCritical = product.min_stock > 0 && totalStock < product.min_stock
                const totalValue = product.kg_price * totalStock

                return (
                  <TableRow key={product.id} className="hover:bg-panel border-b border-border">
                    <TableCell className="text-text font-medium">{product.code}</TableCell>
                    <TableCell className="text-text">{product.name}</TableCell>
                    <TableCell className="text-text">
                      <Badge variant="outline" className="text-text border-border">
                        {t(product.type.toLowerCase())}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-text">{product.unit}</TableCell>
                    <TableCell className="text-text">%{product.vat_rate}</TableCell>
                    <TableCell className={`text-text ${isCritical ? 'text-red-500 font-semibold' : ''}`}>
                      {product.min_stock}
                    </TableCell>
                    <TableCell className={`text-text ${isCritical ? 'text-red-500 font-semibold' : ''}`}>
                      {totalStock}
                    </TableCell>
                    <TableCell className="text-text">₺{product.kg_price.toFixed(2)}</TableCell>
                    <TableCell className="text-text">₺{totalValue.toLocaleString()}</TableCell>
                    <TableCell className="text-text">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(product)}
                          className="bg-panel border-border text-text hover:bg-primary hover:text-white"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(product)}
                          className="bg-panel border-border text-text hover:bg-red-500 hover:text-white"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-text-muted text-sm">
          {t('showing_results', {
            start: (currentPage - 1) * productsPerPage + 1,
            end: Math.min(currentPage * productsPerPage, sortedProducts.length),
            total: sortedProducts.length,
          })}
        </p>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="bg-panel border-border text-text">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="bg-primary text-white border-primary">
            1
          </Button>
          <Button variant="outline" size="sm" className="bg-panel border-border text-text">
            2
          </Button>
          <Button variant="outline" size="sm" className="bg-panel border-border text-text">
            3
          </Button>
          <span className="text-text-muted">...</span>
          <Button variant="outline" size="sm" className="bg-panel border-border text-text">
            10
          </Button>
          <Button variant="outline" size="sm" className="bg-panel border-border text-text">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Edit Modal */}
      <ProductEditModal
        isOpen={isEditModalOpen}
        onClose={handleModalClose}
        product={selectedProduct}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
