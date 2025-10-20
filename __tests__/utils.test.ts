import { describe, it, expect } from 'vitest'
import {
  calculatePriceWithVat,
  calculateVatAmount,
  formatCurrency,
  formatNumber,
  isLowStock,
  getStockStatus,
  formatDate,
  formatDateTime,
  normalizeSearchTerm,
  isValidEmail,
  isValidPhone,
} from '@/lib/utils'

describe('Utils', () => {
  describe('calculatePriceWithVat', () => {
    it('should calculate price with VAT correctly', () => {
      expect(calculatePriceWithVat(100, 18)).toBe(118)
      expect(calculatePriceWithVat(50, 0)).toBe(50)
      expect(calculatePriceWithVat(200, 20)).toBe(240)
    })
  })

  describe('calculateVatAmount', () => {
    it('should calculate VAT amount correctly', () => {
      expect(calculateVatAmount(100, 18)).toBe(18)
      expect(calculateVatAmount(50, 0)).toBe(0)
      expect(calculateVatAmount(200, 20)).toBe(40)
    })
  })

  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(100)).toBe('₺100,00')
      expect(formatCurrency(1234.56)).toBe('₺1.234,56')
      expect(formatCurrency(0)).toBe('₺0,00')
    })
  })

  describe('formatNumber', () => {
    it('should format number correctly', () => {
      expect(formatNumber(100)).toBe('100,00')
      expect(formatNumber(1234.56)).toBe('1.234,56')
      expect(formatNumber(100, 0)).toBe('100')
    })
  })

  describe('isLowStock', () => {
    it('should check low stock correctly', () => {
      expect(isLowStock(5, 10)).toBe(true)
      expect(isLowStock(10, 10)).toBe(true)
      expect(isLowStock(15, 10)).toBe(false)
    })
  })

  describe('getStockStatus', () => {
    it('should return correct stock status', () => {
      expect(getStockStatus(0, 10)).toBe('out')
      expect(getStockStatus(5, 10)).toBe('low')
      expect(getStockStatus(15, 10)).toBe('normal')
    })
  })

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2023-12-25')
      expect(formatDate(date)).toBe('25.12.2023')
    })
  })

  describe('formatDateTime', () => {
    it('should format datetime correctly', () => {
      const date = new Date('2023-12-25T14:30:00')
      expect(formatDateTime(date)).toBe('25.12.2023 14:30')
    })
  })

  describe('normalizeSearchTerm', () => {
    it('should normalize search term correctly', () => {
      expect(normalizeSearchTerm('  Test  ')).toBe('test')
      expect(normalizeSearchTerm('Türkçe')).toBe('turkce')
      expect(normalizeSearchTerm('Ürün Adı')).toBe('urun adi')
    })
  })

  describe('isValidEmail', () => {
    it('should validate email correctly', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('invalid-email')).toBe(false)
      expect(isValidEmail('test@')).toBe(false)
      expect(isValidEmail('@example.com')).toBe(false)
    })
  })

  describe('isValidPhone', () => {
    it('should validate phone correctly', () => {
      expect(isValidPhone('+905551234567')).toBe(true)
      expect(isValidPhone('05551234567')).toBe(true)
      expect(isValidPhone('555 123 45 67')).toBe(true)
      expect(isValidPhone('invalid-phone')).toBe(false)
    })
  })
})
