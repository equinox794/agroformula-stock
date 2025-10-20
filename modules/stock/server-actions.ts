'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { ENV } from '@/lib/env'
import { stockMovementSchema, stockTransferSchema, searchSchema } from '@/lib/zod-schemas'
import { revalidatePath } from 'next/cache'

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

export async function addStockMovement(orgId: string, formData: FormData) {
  const supabase = getServiceClient()

  // Demo için kullanıcı ID'si
  const userId = '00000000-0000-0000-0000-000000000000'

  const validatedFields = stockMovementSchema.safeParse({
    productId: formData.get('productId'),
    warehouseId: formData.get('warehouseId'),
    qtyChange: parseFloat(formData.get('qtyChange') as string),
    reason: formData.get('reason'),
    note: formData.get('note'),
  })

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Geçersiz hareket bilgileri',
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { productId, warehouseId, qtyChange, reason, note } = validatedFields.data

  // Çıkış hareketi için stok yeterliliği kontrolü
  if (qtyChange < 0) {
    const { data: stock } = await supabase
      .from('stocks')
      .select('quantity')
      .eq('product_id', productId)
      .eq('warehouse_id', warehouseId)
      .single()

    if (!stock || stock.quantity < Math.abs(qtyChange)) {
      return {
        success: false,
        message: 'Yetersiz stok. Mevcut stok: ' + (stock?.quantity || 0),
      }
    }
  }

  // Stok hareketi oluştur
  const { data, error } = await supabase
    .from('stock_movements')
    .insert({
      org_id: orgId,
      product_id: productId,
      warehouse_id: warehouseId,
      qty_change: qtyChange,
      reason,
      note,
      created_by: userId,
    })
    .select()
    .single()

  if (error) {
    return {
      success: false,
      message: 'Stok hareketi oluşturulurken hata oluştu.',
    }
  }

  // Stocks tablosunu güncelle
  const { data: existingStock } = await supabase
    .from('stocks')
    .select('quantity')
    .eq('product_id', productId)
    .eq('warehouse_id', warehouseId)
    .single()

  if (existingStock) {
    // Mevcut stok varsa güncelle
    const { error: updateError } = await supabase
      .from('stocks')
      .update({
        quantity: existingStock.quantity + qtyChange,
        updated_at: new Date().toISOString()
      })
      .eq('product_id', productId)
      .eq('warehouse_id', warehouseId)

    if (updateError) {
      console.error('Stok güncellenemedi:', updateError)
    }
  } else {
    // Yeni stok kaydı oluştur
    const { error: insertError } = await supabase
      .from('stocks')
      .insert({
        product_id: productId,
        warehouse_id: warehouseId,
        quantity: qtyChange,
        org_id: orgId
      })

    if (insertError) {
      console.error('Stok oluşturulamadı:', insertError)
    }
  }

  revalidatePath('/stock')
  revalidatePath('/stock/movements')
  return {
    success: true,
    message: 'Stok hareketi başarıyla oluşturuldu.',
    data,
  }
}

export async function transferStock(orgId: string, formData: FormData) {
  const supabase = getServiceClient()

  // Demo için kullanıcı ID'si
  const userId = '00000000-0000-0000-0000-000000000000'

  const validatedFields = stockTransferSchema.safeParse({
    productId: formData.get('productId'),
    fromWarehouseId: formData.get('fromWarehouseId'),
    toWarehouseId: formData.get('toWarehouseId'),
    quantity: parseFloat(formData.get('quantity') as string),
    note: formData.get('note'),
  })

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Geçersiz transfer bilgileri',
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { productId, fromWarehouseId, toWarehouseId, quantity, note } = validatedFields.data

  if (fromWarehouseId === toWarehouseId) {
    return {
      success: false,
      message: 'Kaynak ve hedef depo aynı olamaz.',
    }
  }

  // Kaynak depoda yeterli stok var mı kontrol et
  const { data: sourceStock } = await supabase
    .from('stocks')
    .select('quantity')
    .eq('product_id', productId)
    .eq('warehouse_id', fromWarehouseId)
    .single()

  if (!sourceStock || sourceStock.quantity < quantity) {
    return {
      success: false,
      message: 'Kaynak depoda yetersiz stok. Mevcut stok: ' + (sourceStock?.quantity || 0),
    }
  }

  // Transfer işlemini başlat
  const { error: beginError } = await supabase.rpc('begin_transaction')
  if (beginError) {
    return {
      success: false,
      message: 'Transfer işlemi başlatılamadı.',
    }
  }

  try {
    // Çıkış hareketi
    const { error: outError } = await supabase
      .from('stock_movements')
      .insert({
        org_id: orgId,
        product_id: productId,
        warehouse_id: fromWarehouseId,
        qty_change: -quantity,
        reason: 'transfer',
        note: `Transfer to ${toWarehouseId}. ${note || ''}`,
        created_by: userId,
      })

    if (outError) throw outError

    // Giriş hareketi
    const { error: inError } = await supabase
      .from('stock_movements')
      .insert({
        org_id: orgId,
        product_id: productId,
        warehouse_id: toWarehouseId,
        qty_change: quantity,
        reason: 'transfer',
        note: `Transfer from ${fromWarehouseId}. ${note || ''}`,
        created_by: userId,
      })

    if (inError) throw inError

    // İşlemi onayla
    const { error: commitError } = await supabase.rpc('commit_transaction')
    if (commitError) throw commitError

    revalidatePath('/stock')
    revalidatePath('/stock/movements')
    return {
      success: true,
      message: 'Stok transferi başarıyla tamamlandı.',
    }
  } catch (error) {
    // Hata durumunda işlemi geri al
    await supabase.rpc('rollback_transaction')
    return {
      success: false,
      message: 'Stok transferi sırasında hata oluştu.',
    }
  }
}

export async function getStockList(orgId: string, searchParams?: {
  query?: string
  warehouseId?: string
  productType?: string
  lowStock?: boolean
  page?: number
  limit?: number
}) {
  const supabase = getServiceClient()

  let query = supabase
    .from('products')
    .select(`
      *,
      stocks (
        warehouse_id,
        quantity,
        warehouses (
          id,
          name
        )
      )
    `)
    .eq('org_id', orgId)

  if (searchParams?.query) {
    query = query.or(`code.ilike.%${searchParams.query}%,name.ilike.%${searchParams.query}%`)
  }

  if (searchParams?.productType) {
    query = query.eq('type', searchParams.productType)
  }

  const { data: products, error } = await query.order('name')

  if (error) {
    return {
      success: false,
      message: 'Stok listesi getirilirken hata oluştu.',
    }
  }

  // Stok verilerini işle
  const processedData = products?.map(product => {
    const stocks = product.stocks || []
    const totalQuantity = stocks.reduce((sum: number, stock: any) => sum + stock.quantity, 0)
    const isLowStock = totalQuantity <= product.min_stock

    // Belirli depo filtresi
    let filteredStocks = stocks
    if (searchParams?.warehouseId) {
      filteredStocks = stocks.filter((stock: any) => stock.warehouse_id === searchParams.warehouseId)
    }

    return {
      ...product,
      stocks: filteredStocks,
      totalQuantity,
      isLowStock,
    }
  }) || []

  // Düşük stok filtresi
  let filteredData = processedData
  if (searchParams?.lowStock) {
    filteredData = processedData.filter(item => item.isLowStock)
  }

  // Sayfalama
  const page = searchParams?.page || 1
  const limit = searchParams?.limit || 10
  const offset = (page - 1) * limit
  const paginatedData = filteredData.slice(offset, offset + limit)

  return {
    success: true,
    data: paginatedData,
    pagination: {
      page,
      limit,
      total: filteredData.length,
      totalPages: Math.ceil(filteredData.length / limit),
    },
  }
}

export async function getStockMovements(orgId: string, searchParams?: {
  productId?: string
  warehouseId?: string
  page?: number
  limit?: number
}) {
  const supabase = getServiceClient()

  let query = supabase
    .from('stock_movements')
    .select(`
      *,
      products (
        code,
        name
      ),
      warehouses (
        name
      ),
      profiles (
        full_name
      )
    `)
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })

  if (searchParams?.productId) {
    query = query.eq('product_id', searchParams.productId)
  }

  if (searchParams?.warehouseId) {
    query = query.eq('warehouse_id', searchParams.warehouseId)
  }

  const page = searchParams?.page || 1
  const limit = searchParams?.limit || 20
  const offset = (page - 1) * limit

  const { data, error, count } = await query
    .range(offset, offset + limit - 1)

  if (error) {
    return {
      success: false,
      message: 'Stok hareketleri getirilirken hata oluştu.',
    }
  }

  return {
    success: true,
    data: data || [],
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  }
}

export async function getLowStockProducts(orgId: string) {
  const supabase = getServiceClient()

  const { data, error } = await supabase.rpc('get_low_stock_products', {
    p_org_id: orgId,
  })

  if (error) {
    return {
      success: false,
      message: 'Düşük stok ürünleri getirilirken hata oluştu.',
    }
  }

  return {
    success: true,
    data: data || [],
  }
}

export async function updateStockQuantity(productId: string, warehouseId: string, quantity: number) {
  try {
    const supabase = getServiceClient()

    // Mevcut stok kaydını kontrol et
    const { data: existingStock } = await supabase
      .from('stocks')
      .select('id, quantity')
      .eq('product_id', productId)
      .eq('warehouse_id', warehouseId)
      .single()

    if (existingStock) {
      // Mevcut stok varsa güncelle
      const { error: updateError } = await supabase
        .from('stocks')
        .update({
          quantity: quantity,
          updated_at: new Date().toISOString()
        })
        .eq('product_id', productId)
        .eq('warehouse_id', warehouseId)

      if (updateError) {
        console.error('Stok güncellenemedi:', updateError)
        return { success: false, error: updateError.message }
      }
    } else {
      // Yeni stok kaydı oluştur
      const { error: insertError } = await supabase
        .from('stocks')
        .insert({
          product_id: productId,
          warehouse_id: warehouseId,
          quantity: quantity
        })

      if (insertError) {
        console.error('Stok oluşturulamadı:', insertError)
        return { success: false, error: insertError.message }
      }
    }

    // Stok hareketi kaydı oluştur (audit için)
    const { error: movementError } = await supabase
      .from('stock_movements')
      .insert({
        org_id: '00000000-0000-0000-0000-000000000000',
        product_id: productId,
        warehouse_id: warehouseId,
        qty_change: existingStock ? quantity - existingStock.quantity : quantity,
        reason: 'adjust',
        note: 'Mevcut stok güncellemesi',
        created_by: '00000000-0000-0000-0000-000000000000'
      })

    if (movementError) {
      console.error('Stok hareketi kaydedilemedi:', movementError)
      // Bu hata kritik değil, devam et
    }

    revalidatePath('/stock')
    return { success: true }
  } catch (error) {
    console.error('Stok güncellenemedi:', error)
    return { success: false, error: 'Beklenmeyen bir hata oluştu' }
  }
}
