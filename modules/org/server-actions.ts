'use server'

import { createClient } from '@/lib/supabase/server'
import { organizationSchema, membershipSchema } from '@/lib/zod-schemas'
import { revalidatePath } from 'next/cache'

export async function createOrganization(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return {
      success: false,
      message: 'Kullanıcı bulunamadı.',
    }
  }

  const validatedFields = organizationSchema.safeParse({
    name: formData.get('name'),
  })

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Geçersiz organizasyon bilgileri',
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { name } = validatedFields.data

  // Organizasyonu oluştur
  const { data: orgData, error: orgError } = await supabase
    .from('organizations')
    .insert({
      name,
      owner_id: user.id,
    })
    .select()
    .single()

  if (orgError) {
    return {
      success: false,
      message: 'Organizasyon oluşturulurken hata oluştu.',
    }
  }

  // Kullanıcıyı organizasyona admin olarak ekle
  const { error: membershipError } = await supabase
    .from('memberships')
    .insert({
      org_id: orgData.id,
      user_id: user.id,
      role: 'admin',
    })

  if (membershipError) {
    return {
      success: false,
      message: 'Üyelik oluşturulurken hata oluştu.',
    }
  }

  // Varsayılan depo oluştur
  const { error: warehouseError } = await supabase
    .from('warehouses')
    .insert({
      org_id: orgData.id,
      name: 'Ana Depo',
      is_default: true,
    })

  if (warehouseError) {
    return {
      success: false,
      message: 'Varsayılan depo oluşturulurken hata oluştu.',
    }
  }

  revalidatePath('/')
  return {
    success: true,
    message: 'Organizasyon başarıyla oluşturuldu.',
    data: orgData,
  }
}

export async function updateOrganization(orgId: string, formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return {
      success: false,
      message: 'Kullanıcı bulunamadı.',
    }
  }

  const validatedFields = organizationSchema.safeParse({
    name: formData.get('name'),
  })

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Geçersiz organizasyon bilgileri',
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { name } = validatedFields.data

  const { error } = await supabase
    .from('organizations')
    .update({ name })
    .eq('id', orgId)

  if (error) {
    return {
      success: false,
      message: 'Organizasyon güncellenirken hata oluştu.',
    }
  }

  revalidatePath('/')
  return {
    success: true,
    message: 'Organizasyon başarıyla güncellendi.',
  }
}

export async function addMember(orgId: string, formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return {
      success: false,
      message: 'Kullanıcı bulunamadı.',
    }
  }

  const validatedFields = membershipSchema.safeParse({
    userId: formData.get('userId'),
    role: formData.get('role'),
  })

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Geçersiz üyelik bilgileri',
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { userId, role } = validatedFields.data

  // Kullanıcının bu organizasyonda admin olup olmadığını kontrol et
  const { data: membership } = await supabase
    .from('memberships')
    .select('role')
    .eq('org_id', orgId)
    .eq('user_id', user.id)
    .single()

  if (!membership || membership.role !== 'admin') {
    return {
      success: false,
      message: 'Bu işlem için yetkiniz yok.',
    }
  }

  const { error } = await supabase
    .from('memberships')
    .insert({
      org_id: orgId,
      user_id: userId,
      role,
    })

  if (error) {
    return {
      success: false,
      message: 'Üye eklenirken hata oluştu.',
    }
  }

  revalidatePath('/team')
  return {
    success: true,
    message: 'Üye başarıyla eklendi.',
  }
}

export async function updateMemberRole(orgId: string, userId: string, role: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return {
      success: false,
      message: 'Kullanıcı bulunamadı.',
    }
  }

  // Kullanıcının bu organizasyonda admin olup olmadığını kontrol et
  const { data: membership } = await supabase
    .from('memberships')
    .select('role')
    .eq('org_id', orgId)
    .eq('user_id', user.id)
    .single()

  if (!membership || membership.role !== 'admin') {
    return {
      success: false,
      message: 'Bu işlem için yetkiniz yok.',
    }
  }

  const { error } = await supabase
    .from('memberships')
    .update({ role })
    .eq('org_id', orgId)
    .eq('user_id', userId)

  if (error) {
    return {
      success: false,
      message: 'Üye rolü güncellenirken hata oluştu.',
    }
  }

  revalidatePath('/team')
  return {
    success: true,
    message: 'Üye rolü başarıyla güncellendi.',
  }
}

export async function removeMember(orgId: string, userId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return {
      success: false,
      message: 'Kullanıcı bulunamadı.',
    }
  }

  // Kullanıcının bu organizasyonda admin olup olmadığını kontrol et
  const { data: membership } = await supabase
    .from('memberships')
    .select('role')
    .eq('org_id', orgId)
    .eq('user_id', user.id)
    .single()

  if (!membership || membership.role !== 'admin') {
    return {
      success: false,
      message: 'Bu işlem için yetkiniz yok.',
    }
  }

  // Kendini kaldırmaya çalışıyorsa engelle
  if (user.id === userId) {
    return {
      success: false,
      message: 'Kendinizi organizasyondan kaldıramazsınız.',
    }
  }

  const { error } = await supabase
    .from('memberships')
    .delete()
    .eq('org_id', orgId)
    .eq('user_id', userId)

  if (error) {
    return {
      success: false,
      message: 'Üye kaldırılırken hata oluştu.',
    }
  }

  revalidatePath('/team')
  return {
    success: true,
    message: 'Üye başarıyla kaldırıldı.',
  }
}
