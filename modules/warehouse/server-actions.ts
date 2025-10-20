'use server'

import { createClient as createServiceClient } from '@supabase/supabase-js'
import { ENV } from '@/lib/env'
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

export async function getWarehouses() {
  try {
    const supabase = getServiceClient()

    const { data: warehouses, error } = await supabase
      .from('warehouses')
      .select('*')
      .eq('org_id', DEMO_ORG_ID)
      .order('name', { ascending: true })

    if (error) {
      console.error('❌ Depolar getirilemedi:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ Depolar yüklendi:', warehouses?.length || 0, 'depo')
    return { success: true, data: warehouses || [] }
  } catch (error) {
    console.error('❌ Depolar getirilemedi:', error)
    return { success: false, error: 'Beklenmeyen bir hata oluştu' }
  }
}

export async function createWarehouse(name: string) {
  try {
    const supabase = getServiceClient()

    const { data: newWarehouse, error } = await supabase
      .from('warehouses')
      .insert({
        name,
        org_id: DEMO_ORG_ID
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Depo oluşturulamadı:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ Yeni depo oluşturuldu:', newWarehouse)
    revalidatePath('/stock')
    return { success: true, data: newWarehouse }
  } catch (error) {
    console.error('❌ Depo oluşturulamadı:', error)
    return { success: false, error: 'Beklenmeyen bir hata oluştu' }
  }
}

export async function updateWarehouse(id: string, name: string) {
  try {
    const supabase = getServiceClient()

    const { data: updatedWarehouse, error } = await supabase
      .from('warehouses')
      .update({
        name,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('org_id', DEMO_ORG_ID)
      .select()
      .single()

    if (error) {
      console.error('❌ Depo güncellenemedi:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ Depo güncellendi:', updatedWarehouse)
    revalidatePath('/stock')
    return { success: true, data: updatedWarehouse }
  } catch (error) {
    console.error('❌ Depo güncellenemedi:', error)
    return { success: false, error: 'Beklenmeyen bir hata oluştu' }
  }
}

export async function deleteWarehouse(id: string) {
  try {
    const supabase = getServiceClient()

    const { error } = await supabase
      .from('warehouses')
      .delete()
      .eq('id', id)
      .eq('org_id', DEMO_ORG_ID)

    if (error) {
      console.error('❌ Depo silinemedi:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ Depo silindi:', id)
    revalidatePath('/stock')
    return { success: true }
  } catch (error) {
    console.error('❌ Depo silinemedi:', error)
    return { success: false, error: 'Beklenmeyen bir hata oluştu' }
  }
}