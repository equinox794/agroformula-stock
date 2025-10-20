import { NextResponse } from 'next/server'
import { ENV } from '@/lib/env'

export async function GET() {
  try {
    if (ENV.DEMO) {
      return NextResponse.json({ 
        ok: false, 
        demo: true, 
        message: 'Demo modu aktif - Supabase bağlantısı yok' 
      })
    }

    const response = await fetch(`${ENV.SUPABASE_URL}/auth/v1/health`, {
      headers: { 
        apikey: ENV.SUPABASE_ANON!,
        'Content-Type': 'application/json'
      }
    })
    
    const ok = response.ok
    const text = await response.text()
    
    return NextResponse.json({ 
      ok, 
      status: response.status,
      text: text.substring(0, 200), // İlk 200 karakter
      url: ENV.SUPABASE_URL,
      hasAnonKey: !!ENV.SUPABASE_ANON
    })
  } catch (error: any) {
    return NextResponse.json({ 
      ok: false, 
      error: error.message,
      demo: ENV.DEMO,
      url: ENV.SUPABASE_URL 
    }, { status: 500 })
  }
}
