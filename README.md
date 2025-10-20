# AgroFormula - Modern Stok Yönetim SaaS

Next.js 14, TypeScript, Supabase ve Stripe kullanılarak geliştirilmiş, çok depolu, RBAC'lı stok yönetim SaaS uygulaması.

## 🚀 Özellikler

### Temel Özellikler
- **Çok Depolu Stok Yönetimi**: Sınırsız depo oluşturma ve yönetimi
- **Ürün Yönetimi**: Detaylı ürün bilgileri ve kategorilendirme
- **Stok Hareketleri**: Giriş, çıkış, transfer ve düzeltme işlemleri
- **Kritik Stok Uyarıları**: Otomatik düşük stok bildirimleri
- **Rol Tabanlı Erişim Kontrolü (RBAC)**: Admin, Manager, Viewer rolleri
- **Çoklu Dil Desteği**: Türkçe, İngilizce, Rusça
- **Responsive Tasarım**: Mobil ve desktop uyumlu

### Teknik Özellikler
- **Next.js 14**: App Router, Server Components, SSR
- **TypeScript**: Strict mode ile tip güvenliği
- **Supabase**: PostgreSQL veritabanı ve kimlik doğrulama
- **Stripe**: Abonelik yönetimi ve ödeme işlemleri
- **Tailwind CSS**: Responsive ve modern UI tasarımı
- **shadcn/ui**: Yeniden kullanılabilir UI bileşenleri
- **Zustand**: Client-side state management
- **Zod**: Veri doğrulama ve şema yönetimi
- **i18next**: Uluslararasılaştırma desteği

## 📋 Gereksinimler

- Node.js 18+ 
- npm veya yarn
- Supabase hesabı
- Stripe hesabı (opsiyonel)

## 🛠️ Kurulum

### 1. Projeyi Klonlayın
```bash
git clone <repository-url>
cd af1
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
```

### 3. Environment Variables Ayarlayın
`.env.local` dosyasını oluşturun:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Stripe Configuration (opsiyonel)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

### 4. Supabase Veritabanını Kurun
```bash
# Supabase CLI ile (önerilen)
supabase init
supabase start
supabase db push

# Veya manuel olarak
node scripts/setup-supabase.js
```

### 5. Admin Kullanıcısı Oluşturun
```bash
node scripts/create-admin.js
```

### 6. Development Server'ı Başlatın
```bash
npm run dev
```

Uygulama `http://localhost:3000` adresinde çalışacaktır.

## 📁 Proje Yapısı

```
af1/
├── app/                    # Next.js App Router sayfaları
│   ├── (auth)/            # Kimlik doğrulama sayfaları
│   ├── dashboard/         # Dashboard sayfaları
│   ├── stock/             # Stok yönetim sayfası
│   ├── api/               # API route'ları
│   └── globals.css        # Global CSS
├── components/            # Yeniden kullanılabilir bileşenler
│   ├── ui/               # shadcn/ui bileşenleri
│   ├── layout/           # Layout bileşenleri
│   └── ...
├── lib/                  # Utility fonksiyonları
│   ├── supabase/         # Supabase client'ları
│   ├── env.ts           # Environment variables
│   └── ...
├── modules/              # İş mantığı modülleri
│   ├── auth/            # Kimlik doğrulama
│   ├── product/         # Ürün yönetimi
│   ├── stock/           # Stok yönetimi
│   └── ...
├── styles/              # CSS dosyaları
│   ├── globals.css      # Global stiller
│   └── theme.css        # Tema değişkenleri
├── locales/             # Çoklu dil dosyaları
│   ├── tr/              # Türkçe
│   ├── en/              # İngilizce
│   └── ru/              # Rusça
├── supabase/            # Supabase konfigürasyonu
│   └── migrations/      # Veritabanı migrasyonları
└── scripts/             # Yardımcı scriptler
```

## 🗄️ Veritabanı Şeması

### Ana Tablolar
- **organizations**: Organizasyon bilgileri
- **memberships**: Kullanıcı-organizasyon ilişkileri
- **warehouses**: Depo bilgileri
- **products**: Ürün bilgileri
- **stocks**: Stok miktarları
- **stock_movements**: Stok hareketleri

### RLS (Row Level Security)
Tüm tablolar RLS ile korunur:
- **SELECT**: Kullanıcı organizasyona üye ise erişim
- **INSERT/UPDATE/DELETE**: Admin veya Manager rolü gerekli

## 🔐 Kimlik Doğrulama

### Roller
- **Admin**: Tam erişim, tüm işlemler
- **Manager**: Yazma erişimi, CRUD işlemleri
- **Viewer**: Sadece okuma erişimi

### Demo Kullanıcı
Geliştirme için demo kullanıcı:
- **Email**: admin@agroformula.com
- **Şifre**: admin123

## 🌐 Çoklu Dil Desteği

### Desteklenen Diller
- 🇹🇷 **Türkçe** (varsayılan)
- 🇺🇸 **İngilizce**
- 🇷🇺 **Rusça**

### Dil Değiştirme
Sağ üst köşedeki dil seçici ile dil değiştirilebilir.

## 💳 Abonelik Sistemi

### Planlar
- **Starter**: $29/ay - 5 depo, 100 ürün
- **Pro**: $99/ay - Sınırsız depo ve ürün
- **Business**: $299/ay - Kurumsal özellikler

### Stripe Entegrasyonu
- Webhook ile abonelik yönetimi
- Otomatik faturalandırma
- Ödeme durumu takibi

## 🎨 Tema Sistemi

### Tek Kaynak Tema
Tüm renkler `styles/theme.css` dosyasından yönetilir:

```css
:root {
  --bg: #0a0a0a;
  --panel: #1a1a1a;
  --text: #ffffff;
  --primary: #3b82f6;
  /* ... */
}
```

### Kullanım
```tsx
<div className="bg-panel text-text border-border">
  {/* Tema değişkenleri kullanılır */}
</div>
```

## 🧪 Test

### Test Komutları
```bash
# Linting
npm run lint

# Type checking
npm run typecheck

# Unit tests
npm run test

# Dead code detection
npm run prune:check
```

### Test Kapsamı
- Unit testler (Vitest)
- Component testler (Testing Library)
- Integration testler

## 🚀 Deployment

### Vercel (Önerilen)
```bash
# Vercel CLI ile
vercel

# GitHub ile otomatik deployment
# main branch'e push yapın
```

### Environment Variables (Production)
```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
NEXT_PUBLIC_APP_URL=https://your-domain.com
STRIPE_SECRET_KEY=your_production_stripe_key
STRIPE_WEBHOOK_SECRET=your_production_webhook_secret
```

## 📊 Monitoring

### Supabase Dashboard
- Veritabanı performansı
- Auth istatistikleri
- API kullanımı

### Sentry (Opsiyonel)
Hata takibi için Sentry entegrasyonu mevcut.

## 🔧 Geliştirme

### Port Yönetimi
Uygulama her zaman `http://localhost:3000` adresinde çalışmalıdır:

```bash
# Port kontrolü ile başlatma
npm run dev

# Zorla başlatma
npm run dev:force
```

### Kod Kalitesi
- ESLint + Prettier
- TypeScript strict mode
- Husky pre-commit hooks
- Dead code detection

### Git Workflow
```bash
# Feature branch oluşturma
git checkout -b feature/new-feature

# Commit öncesi kontrol
npm run lint
npm run typecheck

# Commit
git commit -m "feat: add new feature"

# Push
git push origin feature/new-feature
```

## 🐛 Sorun Giderme

### Yaygın Sorunlar

#### 1. Port 3000 Kullanımda
```bash
# Node.js süreçlerini durdur
taskkill /f /im node.exe

# Yeniden başlat
npm run dev
```

#### 2. Supabase Bağlantı Hatası
```bash
# Bağlantıyı test et
npm run diag:supa

# Environment variables kontrol et
node -e "console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)"
```

#### 3. RLS Hatası
```sql
-- Supabase Dashboard > SQL Editor
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
```

#### 4. Mock Data Kullanılıyor
Console'da "mock data kullanılıyor" mesajı görünüyorsa:
1. Supabase bağlantısını kontrol edin
2. RLS'i devre dışı bırakın
3. Environment variables'ları doğrulayın

### Debug Komutları
```bash
# Supabase bağlantı testi
npm run diag:supa

# Demo mode başlatma
npm run start:demo

# Type checking
npm run typecheck

# Linting
npm run lint
```

## 📚 API Dokümantasyonu

### Server Actions
- `getProducts()`: Ürün listesi
- `createProduct()`: Yeni ürün oluşturma
- `updateProduct()`: Ürün güncelleme
- `deleteProduct()`: Ürün silme

### API Routes
- `GET /api/diag/supabase`: Supabase sağlık kontrolü
- `POST /api/webhooks/stripe`: Stripe webhook

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 Destek

- **Email**: support@agroformula.com
- **Dokümantasyon**: [docs.agroformula.com](https://docs.agroformula.com)
- **Issues**: [GitHub Issues](https://github.com/your-org/af1/issues)

## 🙏 Teşekkürler

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend as a Service
- [Stripe](https://stripe.com/) - Payment processing
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components

---

**AgroFormula** - Modern Stok Yönetim Sistemi © 2024