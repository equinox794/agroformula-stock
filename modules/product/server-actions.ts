'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { ENV } from '@/lib/env'

// Product schema
const ProductSchema = z.object({
  code: z.string().min(1, 'Ürün kodu gerekli'),
  name: z.string().min(1, 'Ürün adı gerekli'),
  type: z.enum(['Final', 'SemiFinished', 'Raw'], {
    errorMap: () => ({ message: 'Geçerli bir tip seçin' })
  }),
  unit: z.enum(['kg', 'L', 'piece'], {
    errorMap: () => ({ message: 'Geçerli bir birim seçin' })
  }),
  vat_rate: z.number().min(0).max(100, 'KDV oranı 0-100 arasında olmalı'),
  kg_price: z.number().min(0, 'Fiyat negatif olamaz'),
  min_stock: z.number().min(0, 'Minimum stok negatif olamaz'),
})

const ProductUpdateSchema = ProductSchema.partial().extend({
  id: z.string().min(1, 'Geçerli bir ID gerekli') // Mock data ile uyumlu olması için geçici olarak değiştirildi
})

// Demo için sabit org_id (gerçek uygulamada auth'dan gelecek)
const DEMO_ORG_ID = '00000000-0000-0000-0000-000000000000'

// Service role client (RLS bypass için)
function getServiceClient() {
  if (!ENV.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase yapılandırması eksik')
  }
  
  return createServiceClient(
    ENV.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

export async function getProducts() {
  try {
    const supabase = getServiceClient()
    
    // Önce ürünleri çek
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('org_id', DEMO_ORG_ID)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Ürünler getirilemedi:', error)
      return { success: false, error: error.message }
    }

    // Her ürün için stok verilerini çek
    const productsWithStocks = await Promise.all(
      (products || []).map(async (product) => {
        const { data: stocks } = await supabase
          .from('stocks')
          .select(`
            id,
            quantity,
            warehouses (
              id,
              name
            )
          `)
          .eq('product_id', product.id)

        return {
          ...product,
          stocks: stocks || []
        }
      })
    )

    console.log('✅ Supabase\'den veri yüklendi:', productsWithStocks?.length || 0, 'ürün')
    return { success: true, data: productsWithStocks || [] }
  } catch (error) {
    console.error('❌ Ürünler getirilemedi:', error)
    return { success: false, error: 'Beklenmeyen bir hata oluştu' }
  }
}


export async function createProduct(formData: FormData) {
  try {
    const rawData = {
      name: formData.get('name') as string,
      type: formData.get('type') as string,
      unit: formData.get('unit') as string,
      vat_rate: parseFloat(formData.get('vat_rate') as string),
      kg_price: parseFloat(formData.get('kg_price') as string),
      min_stock: parseFloat(formData.get('min_stock') as string),
    }
    
    // Form'dan gelen kodu kullan (generateProductCode tarafından oluşturulmuş)
    const productCode = formData.get('code') as string

    const validatedData = ProductSchema.parse({ ...rawData, code: productCode })
    
    // Service role client kullan (RLS bypass)
    const supabase = getServiceClient()

    const { data: newProduct, error } = await supabase
      .from('products')
      .insert({
        ...validatedData,
        org_id: DEMO_ORG_ID
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Ürün oluşturulamadı:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ Yeni ürün oluşturuldu:', newProduct)
    revalidatePath('/stock')
    return { success: true, data: newProduct }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    console.error('❌ Ürün oluşturulamadı:', error)
    return { success: false, error: 'Beklenmeyen bir hata oluştu' }
  }
}

export async function updateProduct(formData: FormData) {
  try {
    const rawData = {
      id: formData.get('id') as string,
      code: formData.get('code') as string,
      name: formData.get('name') as string,
      type: formData.get('type') as string,
      unit: formData.get('unit') as string,
      vat_rate: parseFloat(formData.get('vat_rate') as string),
      kg_price: parseFloat(formData.get('kg_price') as string),
      min_stock: parseFloat(formData.get('min_stock') as string),
    }

    const validatedData = ProductUpdateSchema.parse(rawData)
    
    // Service role client kullan (RLS bypass)
    const supabase = getServiceClient()

    const { data: updatedProduct, error } = await supabase
      .from('products')
      .update({
        code: validatedData.code,
        name: validatedData.name,
        type: validatedData.type,
        unit: validatedData.unit,
        vat_rate: validatedData.vat_rate,
        kg_price: validatedData.kg_price,
        min_stock: validatedData.min_stock,
        updated_at: new Date().toISOString()
      })
      .eq('id', validatedData.id)
      .eq('org_id', DEMO_ORG_ID)
      .select()
      .single()

    if (error) {
      console.error('❌ Ürün güncellenemedi:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ Ürün güncellendi:', updatedProduct)
    revalidatePath('/stock')
    return { success: true, data: updatedProduct }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    console.error('❌ Ürün güncellenemedi:', error)
    return { success: false, error: 'Beklenmeyen bir hata oluştu' }
  }
}

export async function deleteProduct(id: string) {
  try {
    // Service role client kullan (RLS bypass)
    const supabase = getServiceClient()

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .eq('org_id', DEMO_ORG_ID)

    if (error) {
      console.error('❌ Ürün silinemedi:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ Ürün silindi:', id)
    revalidatePath('/stock')
    return { success: true }
  } catch (error) {
    console.error('❌ Ürün silinemedi:', error)
    return { success: false, error: 'Beklenmeyen bir hata oluştu' }
  }
}

export async function getProduct(id: string) {
  try {
    const supabase = await createClient()

    if (!supabase) {
      return { success: false, error: 'Veritabanı bağlantısı kurulamadı' }
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .eq('org_id', DEMO_ORG_ID)
      .single()

    if (error) {
      console.error('Ürün getirilemedi:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Ürün getirilemedi:', error)
    return { success: false, error: 'Beklenmeyen bir hata oluştu' }
  }
}