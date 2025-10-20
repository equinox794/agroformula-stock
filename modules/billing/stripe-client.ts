import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export const STRIPE_PLANS = {
  starter: {
    name: 'Starter',
    price: 2900, // $29.00 in cents
    interval: 'month' as const,
    features: [
      '5 depo',
      '100 ürün',
      'Temel raporlar',
      'E-posta desteği',
    ],
  },
  pro: {
    name: 'Pro',
    price: 9900, // $99.00 in cents
    interval: 'month' as const,
    features: [
      'Sınırsız depo',
      'Sınırsız ürün',
      'Gelişmiş raporlar',
      'API erişimi',
      'Öncelikli destek',
    ],
  },
  business: {
    name: 'Business',
    price: 29900, // $299.00 in cents
    interval: 'month' as const,
    features: [
      'Sınırsız depo',
      'Sınırsız ürün',
      'Gelişmiş raporlar',
      'API erişimi',
      'Özel entegrasyonlar',
      '7/24 destek',
    ],
  },
} as const

export type PlanKey = keyof typeof STRIPE_PLANS

export async function createCheckoutSession(
  orgId: string,
  planKey: PlanKey,
  successUrl: string,
  cancelUrl: string
) {
  const plan = STRIPE_PLANS[planKey]

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: plan.name,
          },
          unit_amount: plan.price,
          recurring: {
            interval: plan.interval,
          },
        },
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      orgId,
      plan: planKey,
    },
  })

  return session
}

export async function createCustomerPortalSession(
  customerId: string,
  returnUrl: string
) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })

  return session
}

export async function getSubscription(subscriptionId: string) {
  return await stripe.subscriptions.retrieve(subscriptionId)
}

export async function cancelSubscription(subscriptionId: string) {
  return await stripe.subscriptions.cancel(subscriptionId)
}

export async function updateSubscription(
  subscriptionId: string,
  newPriceId: string
) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  
  return await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: newPriceId,
      },
    ],
    proration_behavior: 'create_prorations',
  })
}
