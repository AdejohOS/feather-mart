import type { UploadedMedia } from '@/hooks/use-supabase-uploads'
import { HousingSystem, PoultryType } from '@/types/types'
import { z } from 'zod'

export const UpdateProfileSchema = z.object({
  full_name: z.string().min(3, 'Name must be 3 or more characters').optional(),
  username: z
    .string()
    .min(3, 'Username should be at least 3 characters')
    .optional(),
  phone_number: z.string().optional()
})
export type UpdateProfileValues = z.infer<typeof UpdateProfileSchema>

export const CreateFarmSchema = z.object({
  //Step 1 fields
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  country: z.string().min(2, 'Please select a country'),
  state: z.string().optional(),
  address: z
    .string()
    .min(10, 'Address must be at least 10 characters')
    .max(255),
  description: z.string().optional(),
  phone_number: z.string().refine(
    val => {
      return /^(\+234[789]\d{9}|\+233[235]\d{8})$/.test(val)
    },
    {
      message: 'Invalid phone number format'
    }
  ),
  website: z.string().url().optional(),
  farmEmail: z.string().email('Invalid email address'),

  //Step 2 fields
  poultryType: z.nativeEnum(PoultryType, {
    required_error: 'Select poultry type'
  }),
  capacity: z
    .number()
    .min(100, 'Minimum capacity is 100 birds')
    .max(1000000, 'Maximun capacity exceeded'),
  housingSystem: z.nativeEnum(HousingSystem, {
    required_error: 'Select housing system'
  }),
  certifications: z
    .array(z.string())
    .max(10, 'Maximum 10 certifications allowed')
    .optional(),

  latitude: z
    .number()
    .min(-90, 'Invalid latitude')
    .max(90, 'Invalid latitude')
    .optional(),
  longitude: z
    .number()
    .min(-180, 'Invalid latitude')
    .max(180, 'Invalid latitude')
    .optional(),
  media: z
    .array(
      z.object({
        url: z.string(),
        name: z.string(),
        size: z.number(),
        type: z.string(),
        path: z.string()
      })
    )
    .optional()
})

export type CreateFarmValues = z.infer<typeof CreateFarmSchema>

export const UpdateFarmSchema = z.object({
  //Step 1 fields
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  country: z.string().min(2, 'Please select a country'),
  state: z.string().optional(),
  address: z
    .string()
    .min(10, 'Address must be at least 10 characters')
    .max(255),
  description: z.string().optional(),
  phone_number: z.string().refine(
    val => {
      return /^(\+234[789]\d{9}|\+233[235]\d{8})$/.test(val)
    },
    {
      message: 'Invalid phone number format'
    }
  ),
  website: z.string().url().optional(),
  farmEmail: z.string().email('Invalid email address'),

  //Step 2 fields
  poultryType: z.nativeEnum(PoultryType, {
    required_error: 'Select poultry type'
  }),
  capacity: z
    .number()
    .min(100, 'Minimum capacity is 100 birds')
    .max(1000000, 'Maximun capacity exceeded'),
  housingSystem: z.nativeEnum(HousingSystem, {
    required_error: 'Select housing system'
  }),
  certifications: z
    .array(z.string())
    .max(10, 'Maximum 10 certifications allowed')
    .optional(),

  latitude: z
    .number()
    .min(-90, 'Invalid latitude')
    .max(90, 'Invalid latitude')
    .optional(),
  longitude: z
    .number()
    .min(-180, 'Invalid latitude')
    .max(180, 'Invalid latitude')
    .optional(),
  media: z
    .array(
      z.object({
        url: z.string(),
        name: z.string(),
        size: z.number(),
        type: z.string(),
        path: z.string()
      })
    )
    .optional()
})

export type UpdateFarmValues = z.infer<typeof UpdateFarmSchema>

export const CreateProductSchema = z
  .object({
    name: z
      .string()
      .min(3, { message: 'Product name must be at least 3 characters' })
      .max(100, { message: 'Product name cannot exceed 100 characters' }),

    description: z
      .string()
      .min(10, { message: 'Description must be at least 10 characters' })
      .max(2000, { message: 'Description cannot exceed 2000 characters' }),

    category: z.string({
      required_error: 'Please select a category'
    }),

    breed: z.string().optional(),

    age: z.string().optional(),

    weight: z.string().optional(),

    // Farm association
    farmId: z.string().uuid().optional(),

    // Pricing & Inventory
    price: z.coerce
      .number()
      .positive({ message: 'Price must be a positive number' })
      .refine(val => val <= 1000000, {
        message: 'Price cannot exceed 1,000,000'
      }),

    discountPrice: z.coerce
      .number()
      .nonnegative({ message: 'Discount price must be a non-negative number' })
      .optional()
      .refine(val => val === undefined || val <= 1000000, {
        message: 'Discount price cannot exceed 1,000,000'
      }),

    stock: z.coerce
      .number()
      .int({ message: 'Stock must be a whole number' })
      .nonnegative({ message: 'Stock must be a non-negative integer' })
      .refine(val => val <= 1000000, {
        message: 'Stock cannot exceed 1,000,000 units'
      }),

    unit: z.string({
      required_error: 'Please select a unit'
    }),

    minimumOrder: z.coerce
      .number()
      .int({ message: 'Minimum order must be a whole number' })
      .nonnegative({ message: 'Minimum order must be a non-negative integer' })
      .optional()
      .refine(val => val === undefined || val <= 10000, {
        message: 'Minimum order cannot exceed 10,000 units'
      }),

    availableDate: z.coerce.date().optional(),

    sku: z
      .string()
      .max(50, { message: 'SKU cannot exceed 50 characters' })
      .optional(),

    // Product Attributes
    isOrganic: z.boolean().default(false),
    isFreeRange: z.boolean().default(false),
    isAntibiotic: z.boolean().default(false),
    isHormone: z.boolean().default(false),
    isVaccinated: z.boolean().default(false),
    isAvailable: z.boolean().default(true),

    // Tags
    tags: z
      .array(z.string())
      .max(20, { message: 'Cannot add more than 20 tags' })
      .optional(),

    // Additional Information
    nutritionalInfo: z
      .string()
      .max(1000, {
        message: 'Nutritional information cannot exceed 1000 characters'
      })
      .optional(),

    storageInstructions: z
      .string()
      .max(1000, {
        message: 'Storage instructions cannot exceed 1000 characters'
      })
      .optional(),

    origin: z
      .string()
      .max(100, { message: 'Origin information cannot exceed 100 characters' })
      .optional(),

    // Uploaded media
    uploadedMedia: z.string().optional(),
    existingMedia: z.string().optional()
  })
  .refine(data => !data.discountPrice || data.discountPrice < data.price, {
    message: 'Discount price must be less than regular price',
    path: ['discountPrice']
  })
  .refine(data => !data.minimumOrder || data.minimumOrder <= data.stock, {
    message: 'Minimum order cannot exceed available stock',
    path: ['minimumOrder']
  })

export type CreateProductValues = z.infer<typeof CreateProductSchema>

export const UpdateProductSchema = z
  .object({
    // Basic Information
    name: z
      .string()
      .min(3, { message: 'Product name must be at least 3 characters' })
      .max(100, { message: 'Product name cannot exceed 100 characters' }),

    description: z
      .string()
      .min(10, { message: 'Description must be at least 10 characters' })
      .max(2000, { message: 'Description cannot exceed 2000 characters' }),

    category: z.string({
      required_error: 'Please select a category'
    }),

    breed: z.string().optional(),

    age: z.string().optional(),

    weight: z.string().optional(),

    // Farm association
    farmId: z.string().uuid().optional(),

    // Pricing & Inventory
    price: z.coerce
      .number()
      .positive({ message: 'Price must be a positive number' })
      .refine(val => val <= 1000000, {
        message: 'Price cannot exceed 1,000,000'
      }),

    discountPrice: z.coerce
      .number()
      .nonnegative({ message: 'Discount price must be a non-negative number' })
      .optional()
      .refine(val => val === undefined || val <= 1000000, {
        message: 'Discount price cannot exceed 1,000,000'
      }),

    stock: z.coerce
      .number()
      .int({ message: 'Stock must be a whole number' })
      .nonnegative({ message: 'Stock must be a non-negative integer' })
      .refine(val => val <= 1000000, {
        message: 'Stock cannot exceed 1,000,000 units'
      }),

    unit: z.string({
      required_error: 'Please select a unit'
    }),

    minimumOrder: z.coerce
      .number()
      .int({ message: 'Minimum order must be a whole number' })
      .nonnegative({ message: 'Minimum order must be a non-negative integer' })
      .optional()
      .refine(val => val === undefined || val <= 10000, {
        message: 'Minimum order cannot exceed 10,000 units'
      }),

    availableDate: z.coerce.date().optional(),

    sku: z
      .string()
      .max(50, { message: 'SKU cannot exceed 50 characters' })
      .optional(),

    // Product Attributes
    isOrganic: z.boolean().default(false),
    isFreeRange: z.boolean().default(false),
    isAntibiotic: z.boolean().default(false),
    isHormone: z.boolean().default(false),
    isVaccinated: z.boolean().default(false),
    isAvailable: z.boolean().default(true),

    // Tags
    tags: z
      .array(z.string())
      .max(20, { message: 'Cannot add more than 20 tags' })
      .optional(),

    // Additional Information
    nutritionalInfo: z
      .string()
      .max(1000, {
        message: 'Nutritional information cannot exceed 1000 characters'
      })
      .optional(),

    storageInstructions: z
      .string()
      .max(1000, {
        message: 'Storage instructions cannot exceed 1000 characters'
      })
      .optional(),

    origin: z
      .string()
      .max(100, { message: 'Origin information cannot exceed 100 characters' })
      .optional(),
    // Uploaded media

    uploadedMedia: z.array(z.custom<UploadedMedia>()).optional(),

    // Existing media (for edit mode)
    existingMedia: z.array(z.custom<UploadedMedia>()).optional()
  })
  .refine(data => !data.discountPrice || data.discountPrice < data.price, {
    message: 'Discount price must be less than regular price',
    path: ['discountPrice']
  })
  .refine(data => !data.minimumOrder || data.minimumOrder <= data.stock, {
    message: 'Minimum order cannot exceed available stock',
    path: ['minimumOrder']
  })

export type UpdateProductValues = z.infer<typeof UpdateProductSchema>
