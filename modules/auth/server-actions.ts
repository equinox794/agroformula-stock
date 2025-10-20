'use server'

import { createClient } from '@/lib/supabase/server'
import { signInSchema, signUpSchema, profileUpdateSchema } from '@/lib/zod-schemas'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function signIn(formData: FormData) {
  const supabase = await createClient()

  const validatedFields = signInSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Geçersiz giriş bilgileri',
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email, password } = validatedFields.data

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return {
      success: false,
      message: 'Giriş başarısız. E-posta veya şifre hatalı.',
    }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signUp(formData: FormData) {
  const supabase = await createClient()

  const validatedFields = signUpSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    username: formData.get('username'),
    fullName: formData.get('fullName'),
  })

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Geçersiz kayıt bilgileri',
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email, password, username, fullName } = validatedFields.data

  // Kullanıcıyı oluştur
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (authError) {
    return {
      success: false,
      message: 'Kayıt başarısız. Bu e-posta adresi zaten kullanılıyor olabilir.',
    }
  }

  if (authData.user) {
    // Profil oluştur
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        username,
        full_name: fullName,
      })

    if (profileError) {
      return {
        success: false,
        message: 'Profil oluşturulurken hata oluştu.',
      }
    }

    // Varsayılan organizasyon oluştur
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: `${fullName}'s Organization`,
        owner_id: authData.user.id,
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
        user_id: authData.user.id,
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
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/sign-in')
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return {
      success: false,
      message: 'Kullanıcı bulunamadı.',
    }
  }

  const validatedFields = profileUpdateSchema.safeParse({
    username: formData.get('username'),
    fullName: formData.get('fullName'),
    avatarUrl: formData.get('avatarUrl'),
  })

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Geçersiz profil bilgileri',
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { username, fullName, avatarUrl } = validatedFields.data

  const { error } = await supabase
    .from('profiles')
    .update({
      username,
      full_name: fullName,
      avatar_url: avatarUrl || null,
    })
    .eq('id', user.id)

  if (error) {
    return {
      success: false,
      message: 'Profil güncellenirken hata oluştu.',
    }
  }

  revalidatePath('/', 'layout')
  return {
    success: true,
    message: 'Profil başarıyla güncellendi.',
  }
}

export async function resetPassword(email: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
  })

  if (error) {
    return {
      success: false,
      message: 'Şifre sıfırlama e-postası gönderilemedi.',
    }
  }

  return {
    success: true,
    message: 'Şifre sıfırlama e-postası gönderildi.',
  }
}
