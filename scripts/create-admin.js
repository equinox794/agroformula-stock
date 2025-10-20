require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase URL veya Key bulunamadı!')
  console.error('Lütfen .env.local dosyasını kontrol edin.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function createAdminUser() {
  try {
    console.log('🔐 Admin kullanıcısı oluşturuluyor...')
    
    // Admin kullanıcısı oluştur
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'admin@agroformula.com',
      password: 'admin123',
      options: {
        data: {
          username: 'admin',
          full_name: 'Admin User'
        }
      }
    })

    if (authError) {
      console.error('❌ Auth hatası:', authError.message)
      return
    }

    console.log('✅ Admin kullanıcısı oluşturuldu!')
    console.log('📧 E-posta: admin@agroformula.com')
    console.log('🔑 Şifre: admin123')
    console.log('👤 Kullanıcı Adı: admin')
    
    // Profile oluştur
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          username: 'admin',
          full_name: 'Admin User',
          email: 'admin@agroformula.com'
        })

      if (profileError) {
        console.log('⚠️ Profile oluşturulurken hata:', profileError.message)
      } else {
        console.log('✅ Profile oluşturuldu!')
      }
    }

  } catch (error) {
    console.error('❌ Hata:', error.message)
  }
}

createAdminUser()
