import { z } from 'zod'

const farmFormSchema = z.object({
  // Basic Information
  name: z
    .string()
    .min(3, { message: 'Farm name must be at least 3 characters' })
    .max(100, { message: 'Farm name cannot exceed 100 characters' }),

  description: z
    .string()
    .min(10, { message: 'Description must be at least 10 characters' })
    .max(2000, { message: 'Description cannot exceed 2000 characters' }),

  establishedDate: z.date().optional(),

  size: z.string().optional(),

  // Location
  address: z
    .string()
    .max(200, { message: 'Address cannot exceed 200 characters' })
    .optional(),
  city: z
    .string()
    .max(100, { message: 'City cannot exceed 100 characters' })
    .optional(),
  state: z
    .string()
    .max(100, { message: 'State/Province cannot exceed 100 characters' })
    .optional(),
  postalCode: z
    .string()
    .max(20, { message: 'Postal code cannot exceed 20 characters' })
    .optional(),
  country: z
    .string()
    .max(100, { message: 'Country cannot exceed 100 characters' })
    .optional(),

  // Add these new fields for precise location
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  formattedAddress: z.string().optional(),
  placeId: z.string().optional(),

  // Contact Information
  contactName: z
    .string()
    .max(100, { message: 'Contact name cannot exceed 100 characters' })
    .optional(),
  contactEmail: z
    .string()
    .email({ message: 'Please enter a valid email address' })
    .optional()
    .or(z.literal('')),
  contactPhone: z
    .string()
    .max(50, { message: 'Phone number cannot exceed 50 characters' })
    .optional(),
  website: z
    .string()
    .url({ message: 'Please enter a valid URL' })
    .optional()
    .or(z.literal('')),

  // Farm Specifics
  farmType: z
    .array(z.string())
    .min(1, { message: 'Please select at least one farm type' }),

  certifications: z.array(z.string()).optional(),

  productionCapacity: z.string().optional(),

  breeds: z.array(z.string()).optional(),

  farmingPractices: z
    .string()
    .max(2000, { message: 'Farming practices cannot exceed 2000 characters' })
    .optional(),

  // Facilities
  housingTypes: z.array(z.string()).optional(),

  hasProcessingFacility: z.boolean().default(false),

  processingDetails: z
    .string()
    .max(1000, { message: 'Processing details cannot exceed 1000 characters' })
    .optional(),

  storageCapabilities: z
    .string()
    .max(1000, {
      message: 'Storage capabilities cannot exceed 1000 characters'
    })
    .optional(),

  biosecurityMeasures: z
    .string()
    .max(1000, {
      message: 'Biosecurity measures cannot exceed 1000 characters'
    })
    .optional(),

  // Business Information
  businessHours: z
    .string()
    .max(500, { message: 'Business hours cannot exceed 500 characters' })
    .optional(),

  deliveryOptions: z.array(z.string()).optional(),

  deliveryDetails: z
    .string()
    .max(1000, { message: 'Delivery details cannot exceed 1000 characters' })
    .optional(),

  pickupAvailable: z.boolean().default(false),

  pickupDetails: z
    .string()
    .max(1000, { message: 'Pickup details cannot exceed 1000 characters' })
    .optional(),

  paymentMethods: z.array(z.string()).optional(),

  wholesaleAvailable: z.boolean().default(false),

  wholesaleDetails: z
    .string()
    .max(1000, { message: 'Wholesale details cannot exceed 1000 characters' })
    .optional(),

  // Media
  uploadedMedia: z.string().optional(),
  existingMedia: z.string().optional()
})

export type FarmFormValues = z.infer<typeof farmFormSchema>

export type FormState = {
  errors?: {
    name?: string[]
    description?: string[]
    // Add other fields as needed
  }
  message?: string
  success?: boolean
  farmId?: string
}
