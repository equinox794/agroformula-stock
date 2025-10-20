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
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
