'use client'

import { useState } from 'react'
import { signUp } from '@/modules/auth/server-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    setMessage('')
    
    try {
      const result = await signUp(formData)
      
      if (result.success) {
        setMessage('Kayıt başarılı! Dashboard\'a yönlendiriliyorsunuz...')
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } else {
        setMessage(result.message || 'Kayıt sırasında hata oluştu')
      }
    } catch (error) {
      setMessage('Beklenmeyen bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Kayıt Ol</CardTitle>
          <CardDescription className="text-center">
            Yeni hesap oluşturun
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="ornek@email.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Kullanıcı Adı</Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="kullaniciadi"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">Ad Soyad</Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Ad Soyad"
                required
              />
            </div>
            {message && (
              <div className={`p-3 rounded-md text-sm ${
                message.includes('başarılı') 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
                {message}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Kayıt Olunuyor...' : 'Kayıt Ol'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Zaten hesabınız var mı?{' '}
            <Link href="/sign-in" className="text-primary hover:underline">
              Giriş yapın
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
