import { createBrowserClient } from '@supabase/ssr'
import { ENV } from '../env'

export function createClient() {
  if (ENV.DEMO) {
    console.warn('🔧 Demo modu: Supabase client oluşturulamıyor')
    return null
  }
  
  return createBrowserClient(
    ENV.SUPABASE_URL!,
    ENV.SUPABASE_ANON!
  )
}
