'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { updateProduct, createProduct, getProducts } from '@/modules/product/server-actions'
import { addStockMovement, updateStockQuantity } from '@/modules/stock/server-actions'
import { getWarehouses, createWarehouse, updateWarehouse } from '@/modules/warehouse/server-actions'
import { useProductStore, Product } from '@/modules/product/store'
import { X, Edit } from 'lucide-react'

interface ProductEditModalProps {
  isOpen: boolean
  onClose: () => void
  product?: Product | null
  onSuccess: (newProduct?: Product) => void
}

export function ProductEditModal({ isOpen, onClose, product, onSuccess }: ProductEditModalProps) {
  const { t } = useTranslation('common')
  const { addProduct, updateProduct: updateProductInStore } = useProductStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState<Product>({
    id: '',
    code: '',
    name: '',
    type: 'Final',
    unit: 'kg',
    vat_rate: 0,
    kg_price: 0,
    min_stock: 0
  })
  
  // Depo yönetimi state'leri
  const [warehouses, setWarehouses] = useState<Array<{id: string, name: string}>>([])
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('')
  const [stockQuantity, setStockQuantity] = useState<number>(0)
  const [isAddingWarehouse, setIsAddingWarehouse] = useState(false)
  const [newWarehouseName, setNewWarehouseName] = useState('')
  const [editingWarehouseId, setEditingWarehouseId] = useState<string | null>(null)
  const [editingWarehouseName, setEditingWarehouseName] = useState('')

  // Depoları yükle
  const loadWarehouses = async () => {
    try {
      const result = await getWarehouses()
      if (result.success && result.data) {
        setWarehouses(result.data)
        if (result.data.length > 0 && !selectedWarehouseId) {
          setSelectedWarehouseId(result.data[0].id)
        }
      }
    } catch (error) {
      console.error('Depolar yüklenemedi:', error)
    }
  }

  // Otomatik ürün kodu üret
  const generateProductCode = async () => {
    if (!product?.id) { // Sadece yeni ürün için
      try {
        const result = await getProducts()
        if (result.success && result.data) {
          const agCodes = result.data
            .filter(p => p.code && p.code.startsWith('AG'))
            .map(p => p.code)
            .sort((a, b) => b.localeCompare(a))

          let newCode = 'AG001' // Varsayılan kod
          
          if (agCodes.length > 0) {
            const lastCode = agCodes[0]
            const match = lastCode.match(/(\d+)/)
            if (match) {
              const nextNumber = parseInt(match[1], 10) + 1
              newCode = `AG${String(nextNumber).padStart(3, '0')}`
            }
          }

          // Kodun benzersiz olduğundan emin ol
          let finalCode = newCode
          let counter = 1
          while (agCodes.includes(finalCode)) {
            const match = newCode.match(/(\d+)/)
            if (match) {
              const baseNumber = parseInt(match[1], 10)
              const nextNumber = baseNumber + counter
              finalCode = `AG${String(nextNumber).padStart(3, '0')}`
              counter++
            } else {
              break
            }
          }

          setFormData(prev => ({ ...prev, code: finalCode }))
        }
      } catch (error) {
        console.error('Ürün kodu üretilemedi:', error)
      }
    }
  }

  // Form'u product verisiyle doldur
  useEffect(() => {
    if (product) {
      setFormData(product)
      // Mevcut stok miktarını hesapla
      const totalStock = product.stocks?.reduce((sum, stock) => sum + stock.quantity, 0) || 0
      setStockQuantity(totalStock)
    } else {
      setFormData({
        id: '',
        code: '',
        name: '',
        type: 'Final',
        unit: 'kg',
        vat_rate: 0,
        kg_price: 0,
        min_stock: 0
      })
      setStockQuantity(0)
      // Yeni ürün için otomatik kod üret
      if (isOpen) {
        generateProductCode()
      }
    }
    setError('')
  }, [product, isOpen])

  // Depoları yükle
  useEffect(() => {
    if (isOpen) {
      loadWarehouses()
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const form = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        form.append(key, value.toString())
      })

      let result
      if (product?.id) {
        form.append('id', product.id)
        result = await updateProduct(form)
        if (result.success) {
          // Store'u güncelle
          updateProductInStore(product.id, formData)
          
              // Mevcut stok miktarını kaydet
              if (selectedWarehouseId && result.data?.id) {
                await updateStockQuantity(result.data.id, selectedWarehouseId, stockQuantity)
              }
          
          onSuccess()
          onClose()
        } else {
          setError(result.error || 'Güncelleme başarısız')
        }
      } else {
        result = await createProduct(form)
        if (result.success) {
          // Store'a ekle
          const newProduct = {
            ...formData,
            id: result.data?.id || `mock_${Date.now()}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          addProduct(newProduct)
          
              // Mevcut stok miktarını kaydet
              if (selectedWarehouseId && result.data?.id) {
                await updateStockQuantity(result.data.id, selectedWarehouseId, stockQuantity)
              }
          
          onSuccess(newProduct)
          onClose()
        } else {
          setError(result.error || 'Oluşturma başarısız')
        }
      }
    } catch (error) {
      setError('Beklenmeyen bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof Product, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Depo yönetimi fonksiyonları
  const handleAddWarehouse = async () => {
    if (!newWarehouseName.trim()) return
    
    try {
      const result = await createWarehouse(newWarehouseName.trim())
      if (result.success) {
        setNewWarehouseName('')
        setIsAddingWarehouse(false)
        await loadWarehouses()
      } else {
        setError(result.error || 'Depo eklenemedi')
      }
    } catch (error) {
      setError('Depo eklenirken hata oluştu')
    }
  }

  const handleUpdateWarehouse = async () => {
    if (!editingWarehouseId || !editingWarehouseName.trim()) return
    
    try {
      const result = await updateWarehouse(editingWarehouseId, editingWarehouseName.trim())
      if (result.success) {
        setEditingWarehouseId(null)
        setEditingWarehouseName('')
        await loadWarehouses()
      } else {
        setError(result.error || 'Depo güncellenemedi')
      }
    } catch (error) {
      setError('Depo güncellenirken hata oluştu')
    }
  }

  const startEditWarehouse = (warehouse: {id: string, name: string}) => {
    setEditingWarehouseId(warehouse.id)
    setEditingWarehouseName(warehouse.name)
  }

  const cancelEditWarehouse = () => {
    setEditingWarehouseId(null)
    setEditingWarehouseName('')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-panel border-border">
        <DialogHeader>
          <DialogTitle className="text-text">
            {product?.id ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
          </DialogTitle>
          <DialogDescription className="text-text-muted">
            {product?.id ? 'Ürün bilgilerini güncelleyin' : 'Yeni ürün bilgilerini girin'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code" className="text-text">Ürün Kodu (otomatik oluşturulur)</Label>
              <Input
                id="code"
                value={formData.code}
                className="bg-bg border-border text-text-muted"
                placeholder="Otomatik oluşturulacak"
                readOnly
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name" className="text-text">Ürün Adı</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="bg-bg border-border text-text"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type" className="text-text">Tip</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleInputChange('type', value as Product['type'])}
              >
                <SelectTrigger className="bg-bg border-border text-text">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Final">Final Product</SelectItem>
                  <SelectItem value="SemiFinished">Semi-Finished</SelectItem>
                  <SelectItem value="Raw">Raw Material</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit" className="text-text">Birim</Label>
              <Select
                value={formData.unit}
                onValueChange={(value) => handleInputChange('unit', value as Product['unit'])}
              >
                <SelectTrigger className="bg-bg border-border text-text">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="L">L</SelectItem>
                  <SelectItem value="piece">piece</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vat_rate" className="text-text">KDV Oranı (%)</Label>
              <Input
                id="vat_rate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.vat_rate}
                onChange={(e) => handleInputChange('vat_rate', parseFloat(e.target.value) || 0)}
                className="bg-bg border-border text-text"
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kg_price" className="text-text">Kg Fiyatı (₺)</Label>
              <Input
                id="kg_price"
                type="number"
                min="0"
                step="0.01"
                value={formData.kg_price}
                onChange={(e) => handleInputChange('kg_price', parseFloat(e.target.value) || 0)}
                className="bg-bg border-border text-text"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="min_stock" className="text-text">Min. Stok</Label>
              <Input
                id="min_stock"
                type="number"
                min="0"
                step="0.01"
                value={formData.min_stock}
                onChange={(e) => handleInputChange('min_stock', parseFloat(e.target.value) || 0)}
                className="bg-bg border-border text-text"
                required
              />
            </div>
          </div>

          {/* Stok Yönetimi */}
          <div className="space-y-4 border-t border-border pt-4">
            <h3 className="text-lg font-semibold text-text">Stok Yönetimi</h3>
            
            {/* Depo Seçimi */}
            <div className="space-y-2">
              <Label className="text-text">Depo Seçimi</Label>
              <div className="flex items-center space-x-2">
                <Select
                  value={selectedWarehouseId}
                  onValueChange={setSelectedWarehouseId}
                >
                  <SelectTrigger className="bg-bg border-border text-text flex-1">
                    <SelectValue placeholder="Depo seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((warehouse) => (
                      <SelectItem key={warehouse.id} value={warehouse.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{warehouse.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              startEditWarehouse(warehouse)
                            }}
                            className="ml-2 h-6 w-6 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddingWarehouse(true)}
                  className="bg-panel border-border text-text"
                >
                  + Depo Ekle
                </Button>
              </div>
            </div>

            {/* Depo Ekleme */}
            {isAddingWarehouse && (
              <div className="space-y-2 p-3 bg-panel border border-border rounded-md">
                <Label className="text-text">Yeni Depo Adı</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={newWarehouseName}
                    onChange={(e) => setNewWarehouseName(e.target.value)}
                    className="bg-bg border-border text-text"
                    placeholder="Depo adını girin"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddWarehouse}
                    disabled={!newWarehouseName.trim()}
                    className="bg-primary text-white"
                  >
                    Ekle
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsAddingWarehouse(false)
                      setNewWarehouseName('')
                    }}
                    className="bg-panel border-border text-text"
                  >
                    İptal
                  </Button>
                </div>
              </div>
            )}

            {/* Depo Düzenleme */}
            {editingWarehouseId && (
              <div className="space-y-2 p-3 bg-panel border border-border rounded-md">
                <Label className="text-text">Depo Adını Düzenle</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={editingWarehouseName}
                    onChange={(e) => setEditingWarehouseName(e.target.value)}
                    className="bg-bg border-border text-text"
                    placeholder="Depo adını girin"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleUpdateWarehouse}
                    disabled={!editingWarehouseName.trim()}
                    className="bg-primary text-white"
                  >
                    Güncelle
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={cancelEditWarehouse}
                    className="bg-panel border-border text-text"
                  >
                    İptal
                  </Button>
                </div>
              </div>
            )}

            {/* Mevcut Stok Bilgisi */}
            {selectedWarehouseId && (
              <div className="space-y-2 p-3 bg-panel border border-border rounded-md">
                <Label className="text-text">Mevcut Stok Bilgisi</Label>
                <div className="text-sm text-text-muted">
                  Seçilen depo: {warehouses.find(w => w.id === selectedWarehouseId)?.name}
                </div>
                <div className="text-sm text-text-muted">
                  Toplam Stok: {stockQuantity} {formData.unit}
                </div>
                <div className="text-sm text-text-muted">
                  Toplam Değer: ₺{(stockQuantity * formData.kg_price).toFixed(2)}
                </div>
              </div>
            )}

                {/* Mevcut Stok */}
                <div className="space-y-2">
                  <Label htmlFor="stock_quantity" className="text-text">Mevcut Stok (kg)</Label>
                  <Input
                    id="stock_quantity"
                    type="number"
                    step="0.01"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(parseFloat(e.target.value) || 0)}
                    className="bg-bg border-border text-text"
                    placeholder="0"
                  />
                  <div className="text-xs text-text-muted">
                    Bu depodaki mevcut stok miktarını girin
                  </div>
                </div>
          </div>

          {error && (
            <div className="p-3 rounded-md bg-red-100 text-red-800 border border-red-200">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="bg-panel border-border text-text">
              İptal
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-primary text-white">
              {isLoading ? 'Kaydediliyor...' : (product?.id ? 'Güncelle' : 'Oluştur')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
