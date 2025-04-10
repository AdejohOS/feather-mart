'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'
import { CalendarIcon, Check, ChevronsUpDown, Loader } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'

import { toast } from 'sonner'
import { FarmSelector } from './farm-selector'
import { z } from 'zod'
import { MediaUpload } from '../../../../../components/media-upload'

import { useCreateProduct, useUpdateProduct } from '@/hooks/use-products'
import { UploadedMedia } from '@/hooks/use-supabase-uploads'

const productFormSchema = z
  .object({
    id: z.string().optional(),
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

    availableDate: z.date().optional(),

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

type ProductFormValues = z.infer<typeof productFormSchema>

// Default values for the form
const defaultValues: Partial<ProductFormValues> = {
  name: '',
  description: '',
  price: 0,
  stock: 0,
  isOrganic: false,
  isFreeRange: false,
  isAntibiotic: false,
  isHormone: false,
  isVaccinated: false,
  isAvailable: true,
  tags: [],
  age: '',
  weight: '',
  discountPrice: 0,
  minimumOrder: 0,
  sku: '',
  uploadedMedia: [],
  existingMedia: []
}

const categories = [
  { label: 'Live Poultry', value: 'live-poultry' },
  { label: 'Eggs', value: 'eggs' },
  { label: 'Meat', value: 'meat' },
  { label: 'Feed & Supplements', value: 'feed-supplements' },
  { label: 'Equipment', value: 'equipment' }
]

const units = [
  { label: 'Per Bird', value: 'bird' },
  { label: 'Dozen', value: 'dozen' },
  { label: 'Kg', value: 'kg' },
  { label: 'Gram', value: 'gram' },
  { label: 'Pound', value: 'pound' },
  { label: 'Box', value: 'box' },
  { label: 'Tray', value: 'tray' }
]

const breeds = [
  { label: 'Broiler', value: 'broiler' },
  { label: 'Layer', value: 'layer' },
  { label: 'Free Range', value: 'free-range' },
  { label: 'Organic', value: 'organic' },
  { label: 'Rhode Island Red', value: 'rhode-island-red' },
  { label: 'Plymouth Rock', value: 'plymouth-rock' },
  { label: 'Leghorn', value: 'leghorn' },
  { label: 'Sussex', value: 'sussex' },
  { label: 'Orpington', value: 'orpington' },
  { label: 'Wyandotte', value: 'wyandotte' },
  { label: 'Other', value: 'other' }
]

interface ProductFormProps {
  initialData?: Partial<ProductFormValues>
  isEditing?: boolean
}

export function ProductForm({ initialData, isEditing }: ProductFormProps) {
  const router = useRouter()
  const [selectedTags, setSelectedTags] = useState<string[]>(
    initialData?.tags || []
  )
  const [openBreed, setOpenBreed] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [allMedia, setAllMedia] = useState<UploadedMedia[]>([])

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      ...defaultValues,
      ...initialData,
      availableDate: initialData?.availableDate
        ? new Date(initialData.availableDate)
        : undefined,
      tags: initialData?.tags || []
    }
  })

  useEffect(() => {
    form.setValue('tags', selectedTags)
  }, [selectedTags, form])

  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()

  useEffect(() => {
    if (initialData) {
      form.reset({
        ...defaultValues,
        ...initialData,
        availableDate: initialData?.availableDate
          ? new Date(initialData.availableDate)
          : undefined
      })
      setSelectedTags(initialData.tags || [])
    }
  }, [initialData, form])

  // Initialize allMedia with existing media when component mounts
  useEffect(() => {
    if (initialData?.existingMedia && initialData.existingMedia.length > 0) {
      console.log(
        'Initializing with existing media:',
        initialData.existingMedia
      )

      // Set the initial media state
      setAllMedia(initialData.existingMedia)

      // Make sure form values are properly set
      form.setValue('existingMedia', initialData.existingMedia, {
        shouldDirty: false, // Don't mark as dirty since this is initial data
        shouldTouch: false, // Don't mark as touched
        shouldValidate: false // Don't trigger validation
      })
    }
  }, [initialData?.existingMedia, form])

  // Handle media updates from the MediaUpload component
  const handleMediaUpdate = (media: UploadedMedia[]) => {
    console.log('Media update received:', media)

    // Update local state
    setAllMedia(media)

    // Separate existing media from new uploads
    const existingMediaItems = media.filter(item => item.id)
    const newUploads = media.filter(item => !item.id)

    console.log('Existing media items:', existingMediaItems)
    console.log('New uploads:', newUploads)

    // Update form values
    form.setValue('existingMedia', existingMediaItems, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: false
    })

    form.setValue('uploadedMedia', newUploads, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: false
    })

    // Force a form state update to ensure the UI reflects the changes
    form.trigger()
  }

  async function onSubmit(data: ProductFormValues) {
    try {
      const formData = new FormData()

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          if (key === 'tags' && Array.isArray(value)) {
            formData.append(key, JSON.stringify(value))
          } else if (key === 'uploadedMedia' && Array.isArray(value)) {
            // Convert the uploadedMedia array to a JSON string
            formData.append(key, JSON.stringify(value))
          } else if (key === 'existingMedia' && Array.isArray(value)) {
            // Also handle existingMedia
            formData.append(key, JSON.stringify(value))
          } else if (key === 'availableDate' && value instanceof Date) {
            formData.append(key, value.toISOString())
          } else {
            formData.append(key, String(value))
          }
        }
      })

      if (isEditing && initialData?.id) {
        formData.append('id', initialData.id)
      }

      if (isEditing) {
        const result = await updateProduct.mutateAsync(formData)
        router.push(`/vendor-marketplace/products/${result.productId}`)
      } else {
        const result = await createProduct.mutateAsync(formData)
        router.push(`/vendor-marketplace/products`)
      }
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong')
    }
  }

  const isPending = createProduct.isPending || updateProduct.isPending

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <Tabs defaultValue='basic' className='w-full'>
          <TabsList className='mb-6 grid grid-cols-4'>
            <TabsTrigger value='basic'>Basic Info</TabsTrigger>
            <TabsTrigger value='pricing'>Pricing & Inventory</TabsTrigger>
            <TabsTrigger value='attributes'>Attributes</TabsTrigger>
            <TabsTrigger value='additional'>Additional Info</TabsTrigger>
          </TabsList>

          <TabsContent value='basic' className='space-y-6'>
            <Card>
              <CardContent className='pt-6'>
                <div className='grid gap-6 md:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='name'
                    render={({ field }) => (
                      <FormItem className='md:col-span-2'>
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                          <Input placeholder='Enter product name' {...field} />
                        </FormControl>
                        <FormDescription>
                          The name of your poultry product as it will appear in
                          the marketplace.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='description'
                    render={({ field }) => (
                      <FormItem className='md:col-span-2'>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder='Describe your product in detail'
                            className='min-h-[120px]'
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Provide a detailed description of your product
                          including quality, features, and benefits.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='category'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select a category' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map(category => (
                              <SelectItem
                                key={category.value}
                                value={category.value}
                              >
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose the category that best fits your product.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FarmSelector form={form} />

                  <FormField
                    control={form.control}
                    name='breed'
                    render={({ field }) => (
                      <FormItem className='flex flex-col'>
                        <FormLabel>Breed</FormLabel>
                        <Popover open={openBreed} onOpenChange={setOpenBreed}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant='outline'
                                role='combobox'
                                aria-expanded={openBreed}
                                className='w-full justify-between'
                              >
                                {field.value
                                  ? breeds.find(
                                      breed => breed.value === field.value
                                    )?.label
                                  : 'Select breed'}
                                <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className='w-full p-0'>
                            <Command>
                              <CommandInput placeholder='Search breed...' />
                              <CommandList>
                                <CommandEmpty>No breed found.</CommandEmpty>
                                <CommandGroup>
                                  {breeds.map(breed => (
                                    <CommandItem
                                      key={breed.value}
                                      value={breed.value}
                                      onSelect={value => {
                                        form.setValue('breed', value)
                                        setOpenBreed(false)
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          'mr-2 h-4 w-4',
                                          field.value === breed.value
                                            ? 'opacity-100'
                                            : 'opacity-0'
                                        )}
                                      />
                                      {breed.label}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          Select the breed of your poultry (if applicable).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className='grid grid-cols-2 gap-4 md:col-span-2'>
                    <FormField
                      control={form.control}
                      name='age'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age</FormLabel>
                          <FormControl>
                            <Input placeholder='e.g., 6 weeks' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='weight'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weight</FormLabel>
                          <FormControl>
                            <Input placeholder='e.g., 2.5 kg' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className='md:col-span-2'>
                    <MediaUpload
                      form={form}
                      maxFiles={5}
                      existingMedia={allMedia}
                      entityId={initialData?.id}
                      mediaType='product'
                      onMediaUpdate={handleMediaUpdate}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='pricing' className='space-y-6'>
            <Card>
              <CardContent className='pt-6'>
                <div className='grid gap-6 md:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='price'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <div className='relative'>
                            <span className='absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground'>
                              $
                            </span>
                            <Input
                              type='number'
                              step='0.01'
                              className='pl-7'
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Set the regular price for your product.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='discountPrice'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Price (Optional)</FormLabel>
                        <FormControl>
                          <div className='relative'>
                            <span className='absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground'>
                              $
                            </span>
                            <Input
                              type='number'
                              step='0.01'
                              className='pl-7'
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Set a discounted price if applicable.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='unit'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select a unit' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {units.map(unit => (
                              <SelectItem key={unit.value} value={unit.value}>
                                {unit.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          How is your product sold?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='stock'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock Quantity</FormLabel>
                        <FormControl>
                          <Input type='number' {...field} />
                        </FormControl>
                        <FormDescription>
                          Number of units available for sale.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='minimumOrder'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Order (Optional)</FormLabel>
                        <FormControl>
                          <Input type='number' {...field} />
                        </FormControl>
                        <FormDescription>
                          Minimum quantity per order.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='availableDate'
                    render={({ field }) => (
                      <FormItem className='flex flex-col'>
                        <FormLabel>Available Date (Optional)</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={'outline'}
                                className={cn(
                                  'w-full pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? (
                                  format(field.value, 'PPP')
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className='w-auto p-0' align='start'>
                            <Calendar
                              mode='single'
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          When will this product be available?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='sku'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SKU (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder='Enter SKU' {...field} />
                        </FormControl>
                        <FormDescription>
                          Stock Keeping Unit for inventory tracking.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='isAvailable'
                    render={({ field }) => (
                      <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 md:col-span-2'>
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className='space-y-1 leading-none'>
                          <FormLabel>Available for Sale</FormLabel>
                          <FormDescription>
                            Uncheck this if the product is out of stock or not
                            ready for sale.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='attributes' className='space-y-6'>
            <Card>
              <CardContent className='pt-6'>
                <div className='space-y-6'>
                  <div>
                    <h3 className='text-lg font-medium'>Product Attributes</h3>
                    <p className='mb-4 text-sm text-muted-foreground'>
                      Select all attributes that apply to your poultry product.
                    </p>
                    <Separator className='my-4' />
                  </div>

                  <div className='grid gap-4 md:grid-cols-2'>
                    <FormField
                      control={form.control}
                      name='isOrganic'
                      render={({ field }) => (
                        <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className='space-y-1 leading-none'>
                            <FormLabel>Organic</FormLabel>
                            <FormDescription>
                              Raised without synthetic pesticides or
                              fertilizers.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='isFreeRange'
                      render={({ field }) => (
                        <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className='space-y-1 leading-none'>
                            <FormLabel>Free Range</FormLabel>
                            <FormDescription>
                              Birds have access to outdoor areas.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='isAntibiotic'
                      render={({ field }) => (
                        <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className='space-y-1 leading-none'>
                            <FormLabel>Antibiotic-Free</FormLabel>
                            <FormDescription>
                              Raised without antibiotics.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='isHormone'
                      render={({ field }) => (
                        <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className='space-y-1 leading-none'>
                            <FormLabel>Hormone-Free</FormLabel>
                            <FormDescription>
                              Raised without added hormones.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='isVaccinated'
                      render={({ field }) => (
                        <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className='space-y-1 leading-none'>
                            <FormLabel>Vaccinated</FormLabel>
                            <FormDescription>
                              Birds have received standard vaccinations.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className='mt-6'>
                    <FormLabel>Product Tags</FormLabel>
                    <div className='mt-2 flex flex-wrap gap-2'>
                      {selectedTags.map(tag => (
                        <div
                          key={tag}
                          className='flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground'
                        >
                          {tag}
                          <button
                            type='button'
                            onClick={() =>
                              setSelectedTags(
                                selectedTags.filter(t => t !== tag)
                              )
                            }
                            className='text-secondary-foreground/70 hover:text-secondary-foreground'
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <Input
                        placeholder='Add tag and press Enter'
                        className='w-full min-w-[200px] flex-1 md:w-auto'
                        onKeyDown={e => {
                          if (e.key === 'Enter' && e.currentTarget.value) {
                            e.preventDefault()
                            if (!selectedTags.includes(e.currentTarget.value)) {
                              const newTags = [
                                ...selectedTags,
                                e.currentTarget.value
                              ]
                              if (newTags.length <= 20) {
                                setSelectedTags(newTags)
                                form.setValue('tags', newTags)
                              } else {
                                toast.error('You cannot add more than 20 tags.')
                              }
                              e.currentTarget.value = ''
                            }
                          }
                        }}
                      />
                    </div>
                    <p className='mt-2 text-sm text-muted-foreground'>
                      Add relevant tags to help buyers find your product (max 20
                      tags).
                    </p>
                    <FormField
                      control={form.control}
                      name='tags'
                      render={() => (
                        <FormItem className='hidden'>
                          <FormControl>
                            <Input type='hidden' />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='additional' className='space-y-6'>
            <Card>
              <CardContent className='pt-6'>
                <div className='grid gap-6'>
                  <FormField
                    control={form.control}
                    name='nutritionalInfo'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Nutritional Information (Optional)
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder='Enter nutritional information'
                            className='min-h-[100px]'
                            value={field.value || ''}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormDescription>
                          Provide nutritional details if applicable.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='storageInstructions'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Storage Instructions (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder='How should this product be stored?'
                            className='min-h-[100px]'
                            value={field.value || ''}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormDescription>
                          Provide instructions for proper storage.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='origin'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Origin (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Where was this product sourced from?'
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Specify the farm, region, or country of origin.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className='flex justify-end gap-4'>
          <Button
            type='button'
            variant='outline'
            onClick={() =>
              isEditing && initialData?.id
                ? router.push(`/vendor-marketplace/products/${initialData.id}`)
                : router.push('/vendor-marketplace/products')
            }
          >
            Cancel
          </Button>
          <Button type='submit' disabled={isPending}>
            {isPending ? (
              <span className='flex items-center gap-2'>
                <Loader className='size-4 animate-spin' />
                {isEditing ? 'Updating...' : 'Creating...'}
              </span>
            ) : (
              `${isEditing ? 'Update' : 'Create'} Product`
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
