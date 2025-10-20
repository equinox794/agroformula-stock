import { describe, it, expect } from 'vitest'
import {
  signInSchema,
  signUpSchema,
  profileUpdateSchema,
  organizationSchema,
  membershipSchema,
  warehouseSchema,
  productSchema,
  stockMovementSchema,
  stockTransferSchema,
  searchSchema,
} from '@/lib/zod-schemas'

describe('Zod Schemas', () => {
  describe('signInSchema', () => {
    it('should validate correct sign in data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
      }
      expect(signInSchema.parse(validData)).toEqual(validData)
    })

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123',
      }
      expect(() => signInSchema.parse(invalidData)).toThrow()
    })

    it('should reject short password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '123',
      }
      expect(() => signInSchema.parse(invalidData)).toThrow()
    })
  })

  describe('signUpSchema', () => {
    it('should validate correct sign up data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
        fullName: 'Test User',
      }
      expect(signUpSchema.parse(validData)).toEqual(validData)
    })

    it('should reject short username', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'password123',
        username: 'ab',
        fullName: 'Test User',
      }
      expect(() => signUpSchema.parse(invalidData)).toThrow()
    })
  })

  describe('productSchema', () => {
    it('should validate correct product data', () => {
      const validData = {
        code: 'PRD001',
        name: 'Test Product',
        type: 'Final',
        unit: 'kg',
        vatRate: 18,
        kgPrice: 100,
        minStock: 10,
      }
      expect(productSchema.parse(validData)).toEqual(validData)
    })

    it('should reject invalid product type', () => {
      const invalidData = {
        code: 'PRD001',
        name: 'Test Product',
        type: 'Invalid',
        unit: 'kg',
        vatRate: 18,
        kgPrice: 100,
        minStock: 10,
      }
      expect(() => productSchema.parse(invalidData)).toThrow()
    })

    it('should reject negative price', () => {
      const invalidData = {
        code: 'PRD001',
        name: 'Test Product',
        type: 'Final',
        unit: 'kg',
        vatRate: 18,
        kgPrice: -100,
        minStock: 10,
      }
      expect(() => productSchema.parse(invalidData)).toThrow()
    })

    it('should reject VAT rate over 100', () => {
      const invalidData = {
        code: 'PRD001',
        name: 'Test Product',
        type: 'Final',
        unit: 'kg',
        vatRate: 150,
        kgPrice: 100,
        minStock: 10,
      }
      expect(() => productSchema.parse(invalidData)).toThrow()
    })
  })

  describe('warehouseSchema', () => {
    it('should validate correct warehouse data', () => {
      const validData = {
        name: 'Test Warehouse',
        location: 'Test Location',
        isDefault: true,
      }
      expect(warehouseSchema.parse(validData)).toEqual(validData)
    })

    it('should reject short warehouse name', () => {
      const invalidData = {
        name: 'A',
        location: 'Test Location',
        isDefault: true,
      }
      expect(() => warehouseSchema.parse(invalidData)).toThrow()
    })
  })

  describe('stockMovementSchema', () => {
    it('should validate correct stock movement data', () => {
      const validData = {
        productId: '123e4567-e89b-12d3-a456-426614174000',
        warehouseId: '123e4567-e89b-12d3-a456-426614174001',
        qtyChange: 10,
        reason: 'in',
        note: 'Test note',
      }
      expect(stockMovementSchema.parse(validData)).toEqual(validData)
    })

    it('should reject zero quantity change', () => {
      const invalidData = {
        productId: '123e4567-e89b-12d3-a456-426614174000',
        warehouseId: '123e4567-e89b-12d3-a456-426614174001',
        qtyChange: 0,
        reason: 'in',
        note: 'Test note',
      }
      expect(() => stockMovementSchema.parse(invalidData)).toThrow()
    })

    it('should reject invalid reason', () => {
      const invalidData = {
        productId: '123e4567-e89b-12d3-a456-426614174000',
        warehouseId: '123e4567-e89b-12d3-a456-426614174001',
        qtyChange: 10,
        reason: 'invalid',
        note: 'Test note',
      }
      expect(() => stockMovementSchema.parse(invalidData)).toThrow()
    })
  })

  describe('stockTransferSchema', () => {
    it('should validate correct transfer data', () => {
      const validData = {
        productId: '123e4567-e89b-12d3-a456-426614174000',
        fromWarehouseId: '123e4567-e89b-12d3-a456-426614174001',
        toWarehouseId: '123e4567-e89b-12d3-a456-426614174002',
        quantity: 10,
        note: 'Test transfer',
      }
      expect(stockTransferSchema.parse(validData)).toEqual(validData)
    })

    it('should reject zero quantity', () => {
      const invalidData = {
        productId: '123e4567-e89b-12d3-a456-426614174000',
        fromWarehouseId: '123e4567-e89b-12d3-a456-426614174001',
        toWarehouseId: '123e4567-e89b-12d3-a456-426614174002',
        quantity: 0,
        note: 'Test transfer',
      }
      expect(() => stockTransferSchema.parse(invalidData)).toThrow()
    })
  })

  describe('searchSchema', () => {
    it('should validate correct search data', () => {
      const validData = {
        query: 'test',
        warehouseId: '123e4567-e89b-12d3-a456-426614174000',
        productType: 'Final',
        lowStock: true,
        page: 1,
        limit: 10,
      }
      expect(searchSchema.parse(validData)).toEqual(validData)
    })

    it('should set default values', () => {
      const data = {}
      const result = searchSchema.parse(data)
      expect(result.page).toBe(1)
      expect(result.limit).toBe(10)
    })
  })
})
