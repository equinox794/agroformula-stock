import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Fiyat hesaplama yardımcıları
export function calculatePriceWithVat(price: number, vatRate: number): number {
  return price * (1 + vatRate / 100)
}

export function calculateVatAmount(price: number, vatRate: number): number {
  return price * (vatRate / 100)
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  }).format(amount)
}

export function formatNumber(number: number, decimals: number = 2): string {
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number)
}

// Stok durumu kontrolü
export function isLowStock(quantity: number, minStock: number): boolean {
  return quantity <= minStock
}

export function getStockStatus(quantity: number, minStock: number): 'low' | 'normal' | 'out' {
  if (quantity === 0) return 'out'
  if (quantity <= minStock) return 'low'
  return 'normal'
}

// Tarih formatları
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('tr-TR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d)
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('tr-TR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

// Pagination yardımcıları
export function getPaginationParams(page: number, limit: number = 10) {
  const offset = (page - 1) * limit
  return { offset, limit }
}

// Arama ve filtreleme
export function normalizeSearchTerm(term: string): string {
  return term
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Türkçe karakterleri normalize et
    .trim()
}

// Validation yardımcıları
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}
