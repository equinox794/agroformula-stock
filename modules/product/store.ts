import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Product {
  id: string
  code: string
  name: string
  type: 'Final' | 'SemiFinished' | 'Raw'
  unit: 'kg' | 'L' | 'piece'
  vat_rate: number
  kg_price: number
  min_stock: number
  stocks?: Array<{
    quantity: number
    warehouses: { name: string }
  }>
  created_at?: string
  updated_at?: string
  org_id?: string
}

interface ProductStore {
  products: Product[]
  isLoading: boolean
  setProducts: (products: Product[]) => void
  addProduct: (product: Product) => void
  updateProduct: (id: string, updated: Partial<Product>) => void
  deleteProduct: (id: string) => void
  setLoading: (loading: boolean) => void
  getProductById: (id: string) => Product | undefined
}

export const useProductStore = create<ProductStore>()(
  persist(
    (set, get) => ({
      products: [],
      isLoading: false,
      
      setProducts: (products) => set({ products }),
      
      addProduct: (product) => set((state) => ({
        products: [...state.products, product]
      })),
      
      updateProduct: (id, updated) => set((state) => ({
        products: state.products.map((p) => 
          p.id === id ? { ...p, ...updated, updated_at: new Date().toISOString() } : p
        )
      })),
      
      deleteProduct: (id) => set((state) => ({
        products: state.products.filter((p) => p.id !== id)
      })),
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      getProductById: (id) => {
        const state = get()
        return state.products.find(p => p.id === id)
      }
    }),
    {
      name: 'demo-products-storage',
      // Sadece products array'ini persist et
      partialize: (state) => ({ products: state.products })
    }
  )
)
