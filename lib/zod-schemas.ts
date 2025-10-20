import { z } from 'zod'

// Kullanıcı şemaları
export const signInSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
})

export const signUpSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
  username: z.string().min(3, 'Kullanıcı adı en az 3 karakter olmalıdır'),
  fullName: z.string().min(2, 'Ad soyad en az 2 karakter olmalıdır'),
})

export const profileUpdateSchema = z.object({
  username: z.string().min(3, 'Kullanıcı adı en az 3 karakter olmalıdır'),
  fullName: z.string().min(2, 'Ad soyad en az 2 karakter olmalıdır'),
  avatarUrl: z.string().url().optional().or(z.literal('')),
})

// Organizasyon şemaları
export const organizationSchema = z.object({
  name: z.string().min(2, 'Organizasyon adı en az 2 karakter olmalıdır'),
})

export const membershipSchema = z.object({
  userId: z.string().uuid('Geçerli bir kullanıcı ID giriniz'),
  role: z.enum(['admin', 'manager', 'viewer'], {
    errorMap: () => ({ message: 'Geçerli bir rol seçiniz' }),
  }),
})

// Depo şemaları
export const warehouseSchema = z.object({
  name: z.string().min(2, 'Depo adı en az 2 karakter olmalıdır'),
  location: z.string().optional(),
  isDefault: z.boolean().default(false),
})

// Ürün şemaları
export const productTypeSchema = z.enum(['Final', 'SemiFinished', 'Raw'], {
  errorMap: () => ({ message: 'Geçerli bir ürün tipi seçiniz' }),
})

export const productUnitSchema = z.enum(['kg', 'L', 'piece'], {
  errorMap: () => ({ message: 'Geçerli bir birim seçiniz' }),
})

export const productSchema = z.object({
  code: z.string().min(1, 'Ürün kodu gereklidir'),
  name: z.string().min(2, 'Ürün adı en az 2 karakter olmalıdır'),
  type: productTypeSchema,
  unit: productUnitSchema.default('kg'),
  vatRate: z.number().min(0).max(100, 'KDV oranı 0-100 arasında olmalıdır'),
  kgPrice: z.number().min(0, 'Fiyat negatif olamaz'),
  minStock: z.number().min(0, 'Minimum stok negatif olamaz'),
})

// Stok şemaları
export const stockMovementReasonSchema = z.enum(['in', 'out', 'transfer', 'adjust'], {
  errorMap: () => ({ message: 'Geçerli bir hareket nedeni seçiniz' }),
})

export const stockMovementSchema = z.object({
  productId: z.string().uuid('Geçerli bir ürün ID giriniz'),
  warehouseId: z.string().uuid('Geçerli bir depo ID giriniz'),
  qtyChange: z.number().refine((val) => val !== 0, 'Miktar değişimi 0 olamaz'),
  reason: stockMovementReasonSchema,
  note: z.string().optional(),
})

export const stockTransferSchema = z.object({
  productId: z.string().uuid('Geçerli bir ürün ID giriniz'),
  fromWarehouseId: z.string().uuid('Kaynak depo seçiniz'),
  toWarehouseId: z.string().uuid('Hedef depo seçiniz'),
  quantity: z.number().min(0.01, 'Transfer miktarı 0\'dan büyük olmalıdır'),
  note: z.string().optional(),
})

// Arama ve filtreleme şemaları
export const searchSchema = z.object({
  query: z.string().optional(),
  warehouseId: z.string().uuid().optional(),
  productType: productTypeSchema.optional(),
  lowStock: z.boolean().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
})

// Stripe şemaları
export const stripePriceSchema = z.object({
  id: z.string(),
  unit_amount: z.number().nullable(),
  currency: z.string(),
  recurring: z.object({
    interval: z.string(),
  }).optional(),
})

export const stripeSubscriptionSchema = z.object({
  id: z.string(),
  status: z.string(),
  current_period_end: z.number(),
  items: z.object({
    data: z.array(z.object({
      price: stripePriceSchema,
    })),
  }),
})

// API yanıt şemaları
export const apiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional(),
})

// Pagination şemaları
export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  total: z.number().min(0),
  totalPages: z.number().min(0),
})

export const paginatedResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: z.array(dataSchema),
    pagination: paginationSchema,
  })
