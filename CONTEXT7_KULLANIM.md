# MCP Sunucuları Kullanım Kılavuzu

## Projede Aktif MCP Sunucuları

Bu projede iki adet MCP sunucusu aktif olarak kullanılmaktadır:

1. **Context7 MCP** - Güncel kod dokümantasyonu
2. **Supabase MCP** - Veritabanı yönetimi ve sorguları

## Context7 Nedir?

Context7, yapay zeka destekli kod editörleri için güncel kod dokümantasyonu sağlayan bir Model Context Protocol (MCP) sunucusudur. Bu araç sayesinde LLM'ler en güncel kütüphane dokümantasyonuna erişebilir ve daha doğru kod örnekleri üretebilir.

## Kurulum Tamamlandı ✅

Context7 MCP sunucusu projenize başarıyla eklendi:

- ✅ Paket yüklendi: `@upstash/context7-mcp`
- ✅ MCP konfigürasyonu oluşturuldu: `.cursor/mcp.json`
- ✅ Test edildi ve çalışıyor

## Nasıl Kullanılır?

### 1. Temel Kullanım

Cursor'da herhangi bir kod sorusu sorarken prompt'unuzun sonuna `use context7` ekleyin:

```
Next.js middleware oluştur ki JWT cookie'lerini kontrol etsin ve kimlik doğrulaması olmayan kullanıcıları /login'e yönlendirsin. use context7
```

```
Cloudflare Worker script'i JSON API yanıtlarını 5 dakika cache'leyecek şekilde yapılandır. use context7
```

### 2. Otomatik Kullanım için Kural Ekleme

Her seferinde `use context7` yazmak istemiyorsanız, Cursor ayarlarından bir kural ekleyebilirsiniz:

1. Cursor Settings > Rules bölümüne gidin
2. Şu kuralı ekleyin:

```
Her zaman kod üretimi, kurulum veya yapılandırma adımları veya kütüphane/API dokümantasyonu gerektiğinde context7 kullan. Bu, Context7 MCP araçlarını otomatik olarak kullanman gerektiği anlamına gelir.
```

### 3. Belirli Kütüphane Kullanımı

Eğer hangi kütüphaneyi kullanmak istediğinizi biliyorsanız, Context7 ID'sini prompt'unuza ekleyin:

```
Supabase ile temel kimlik doğrulama uygula. use library /supabase/supabase for API and docs.
```

## Mevcut Araçlar

Context7 MCP şu araçları sağlar:

- `resolve-library-id`: Genel kütüphane adını Context7 uyumlu kütüphane ID'sine çevirir
- `get-library-docs`: Context7 uyumlu kütüphane ID'si kullanarak kütüphane dokümantasyonunu getirir

## API Anahtarı ✅ Aktif

API anahtarı başarıyla eklendi! Bu sayede:

- ✅ **Daha yüksek rate limit'ler** - Daha fazla istek yapabilirsiniz
- ✅ **Özel repository'lere erişim** - Gizli projelerin dokümantasyonuna erişebilirsiniz
- ✅ **Gelişmiş özellikler** - Context7'nin tüm özelliklerini kullanabilirsiniz

API anahtarı otomatik olarak `.cursor/mcp.json` dosyasına eklendi.

## Faydalar

- ✅ Güncel kod örnekleri (eski eğitim verilerine dayalı değil)
- ✅ Var olmayan API'ların halüsinasyonu yok
- ✅ Eski paket versiyonları için genel cevaplar yok
- ✅ Kaynak koddan doğrudan dokümantasyon

## Sorun Giderme

Eğer Context7 çalışmıyorsa:

1. Cursor'ı yeniden başlatın
2. MCP sunucusunun aktif olduğunu kontrol edin
3. `.cursor/mcp.json` dosyasının doğru formatta olduğunu kontrol edin

---

## Supabase MCP Nedir?

Supabase MCP, yapay zeka araçlarının Supabase veritabanınızla doğrudan etkileşim kurmasını sağlayan bir Model Context Protocol sunucusudur. Bu araç sayesinde doğal dil komutlarıyla veritabanınızı sorgulayabilir, tablolar oluşturabilir ve veri işlemleri gerçekleştirebilirsiniz.

## Supabase MCP Kurulum Tamamlandı ✅

Supabase MCP sunucusu projenize başarıyla eklendi:

- ✅ MCP konfigürasyonu eklendi: `.cursor/mcp.json`
- ✅ Remote sunucu bağlantısı kuruldu: `https://mcp.supabase.com/mcp`

## Supabase MCP Nasıl Kullanılır?

### 1. İlk Kurulum

İlk kullanımda Cursor'ı yeniden başlattığınızda:

1. **Kimlik Doğrulama**: Supabase hesabınıza giriş yapmanız istenecek
2. **Proje Seçimi**: Hangi Supabase projesiyle çalışmak istediğinizi seçin
3. **İzin Onayı**: MCP istemcisine erişim izni verin

### 2. Temel Kullanım

Doğal dil komutlarıyla veritabanınızı yönetin:

```
Supabase veritabanımdaki tüm tabloları listele
```

```
users tablosuna yeni bir kullanıcı ekle: name="Ahmet", email="ahmet@example.com"
```

```
products tablosundaki tüm ürünleri göster
```

```
orders tablosunda bugünkü siparişleri getir
```

### 3. Güvenlik Önerileri

⚠️ **Önemli Güvenlik Uyarıları:**

- **Üretim Ortamına Bağlanmayın**: MCP sunucusunu üretim projesiyle değil, geliştirme projesiyle kullanın
- **Müşterilere Vermeyin**: MCP sunucusu geliştirici izinlerinizle çalışır
- **Salt Okunur Mod**: Gerçek verilere bağlanmanız gerekiyorsa salt okunur modda çalıştırın
- **Proje Kapsamı**: Belirli bir projeyle sınırlayın
- **Dallandırma**: Supabase'in dallandırma özelliğini kullanarak geliştirme dalı oluşturun

### 4. Mevcut Araçlar

Supabase MCP şu araçları sağlar:

- **Veritabanı Sorguları**: SQL komutları çalıştırma
- **Tablo Yönetimi**: Tablo oluşturma, güncelleme, silme
- **Veri İşlemleri**: INSERT, UPDATE, DELETE işlemleri
- **Schema Yönetimi**: Veritabanı şemasını görüntüleme ve düzenleme
- **REST API**: Supabase REST API'sini kullanma

### 5. Örnek Kullanım Senaryoları

```
// Tablo oluşturma
products tablosu oluştur: id (uuid, primary key), name (text), price (numeric), created_at (timestamp)

// Veri ekleme
users tablosuna 5 test kullanıcısı ekle

// Sorgulama
en çok satılan 10 ürünü getir

// Analiz
geçen ayın satış raporunu hazırla
```

## Daha Fazla Bilgi

### Context7
- [Context7 Resmi Sitesi](https://context7.com)
- [GitHub Repository](https://github.com/upstash/context7)
- [Discord Topluluğu](https://upstash.com/discord)

### Supabase
- [Supabase MCP Dokümantasyonu](https://supabase.com/docs/guides/getting-started/mcp)
- [Supabase Resmi Sitesi](https://supabase.com)
- [Supabase Discord Topluluğu](https://discord.supabase.com)
