'use client'

import { useState } from 'react'
import { signIn } from '@/modules/auth/server-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    setMessage('')
    
    try {
      // Demo kullanıcı için basit kontrol
      const email = formData.get('email') as string
      const password = formData.get('password') as string
      
      if (email === 'admin@agroformula.com' && password === 'admin123') {
        setMessage('Giriş başarılı! Dashboard\'a yönlendiriliyorsunuz...')
        setTimeout(() => {
          router.push('/dashboard')
        }, 1500)
      } else {
        setMessage('E-posta veya şifre hatalı. Demo için: admin@agroformula.com / admin123')
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
          <CardTitle className="text-2xl text-center">Giriş Yap</CardTitle>
          <CardDescription className="text-center">
            Hesabınıza giriş yapın
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
              {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Hesabınız yok mu?{' '}
            <Link href="/sign-up" className="text-primary hover:underline">
              Kayıt olun
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
