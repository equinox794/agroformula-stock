'use server'

import { createClient } from '@/lib/supabase/server'
import { createCheckoutSession, createCustomerPortalSession } from './stripe-client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createSubscription(orgId: string, planKey: string) {
  const supabase = await createClient()

  if (!supabase) {
    return {
      success: false,
      message: 'Veritabanı bağlantısı kurulamadı.',
    }
  }

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

  try {
    const session = await createCheckoutSession(
      orgId,
      planKey as any,
      `${process.env.NEXT_PUBLIC_APP_URL}/billing?success=true`,
      `${process.env.NEXT_PUBLIC_APP_URL}/billing?canceled=true`
    )

    return {
      success: true,
      url: session.url,
    }
  } catch (error) {
    console.error('Stripe checkout session creation failed:', error)
    return {
      success: false,
      message: 'Ödeme sayfası oluşturulurken hata oluştu.',
    }
  }
}

export async function createPortalSession(orgId: string) {
  const supabase = await createClient()

  if (!supabase) {
    return {
      success: false,
      message: 'Veritabanı bağlantısı kurulamadı.',
    }
  }

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

  // Mevcut aboneliği kontrol et
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('org_id', orgId)
    .single()

  if (!subscription?.stripe_customer_id) {
    return {
      success: false,
      message: 'Aktif abonelik bulunamadı.',
    }
  }

  try {
    const session = await createCustomerPortalSession(
      subscription.stripe_customer_id,
      `${process.env.NEXT_PUBLIC_APP_URL}/billing`
    )

    return {
      success: true,
      url: session.url,
    }
  } catch (error) {
    console.error('Stripe portal session creation failed:', error)
    return {
      success: false,
      message: 'Müşteri portalı oluşturulurken hata oluştu.',
    }
  }
}

export async function getSubscriptionStatus(orgId: string) {
  const supabase = await createClient()

  if (!supabase) {
    return {
      status: 'inactive',
      plan: null,
      currentPeriodEnd: null,
    }
  }

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('org_id', orgId)
    .single()

  if (!subscription) {
    return {
      status: 'inactive',
      plan: null,
      currentPeriodEnd: null,
    }
  }

  return {
    status: subscription.status,
    plan: subscription.plan,
    currentPeriodEnd: subscription.current_period_end,
  }
}
