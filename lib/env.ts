// Environment variables validation and configuration
export const ENV = {
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_ANON: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE: process.env.SUPABASE_SERVICE_ROLE_KEY,
  DEMO_MODE: process.env.DEMO_MODE === 'true',
  DEMO: process.env.DEMO_MODE === 'true' || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
}

// Runtime validation
if (typeof window === 'undefined') {
  // Server-side validation
  if (!ENV.SUPABASE_URL) {
    console.warn('⚠️ NEXT_PUBLIC_SUPABASE_URL eksik - Demo moduna geçiliyor')
  }
  if (!ENV.SUPABASE_ANON) {
    console.warn('⚠️ NEXT_PUBLIC_SUPABASE_ANON_KEY eksik - Demo moduna geçiliyor')
  }
  if (ENV.DEMO) {
    console.info('🔧 Demo modu aktif - Mock data kullanılıyor')
  }
}
