import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { ENV } from '../env'

export async function createClient() {
  if (ENV.DEMO) {
    console.warn('🔧 Demo modu: Supabase server client oluşturulamıyor')
    return null
  }

  const cookieStore = await cookies()

  return createServerClient(
    ENV.SUPABASE_URL!,
    ENV.SUPABASE_ANON!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set(name, value, options)
          } catch {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set(name, '', { ...options, maxAge: 0 })
          } catch {
            // The `remove` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
