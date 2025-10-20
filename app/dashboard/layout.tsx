import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { ENV } from '@/lib/env'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Demo için auth kontrolünü geçici olarak kaldır
  // const supabase = await createClient()
  // const { data: { user } } = await supabase.auth.getUser()
  // if (!user) {
  //   redirect('/sign-in')
  // }

  return (
    <div className="flex h-screen bg-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        {(ENV.DEMO || ENV.DEMO_MODE) && (
          <div className="bg-amber-500 text-black text-center py-2">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-black rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">
                🔧 Demo Modu Aktif – Supabase bağlantısı kapalı, mock data kullanılıyor
              </span>
            </div>
          </div>
        )}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
