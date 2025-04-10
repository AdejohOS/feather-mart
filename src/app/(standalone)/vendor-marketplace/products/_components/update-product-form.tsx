'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useEffect, useState, useTransition } from 'react'
import {
  CalendarIcon,
  Check,
  ChevronsUpDown,
  Loader2,
  Upload
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useActionState } from 'react'

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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

import { createProductAction, type FormState } from '@/features/action'
import { toast } from 'sonner'
import { FarmSelector } from './farm-selector'
import {
  CreateProductSchema,
  CreateProductValues,
  UpdateProductSchema,
  UpdateProductValues
} from '@/features/vendor/vendor-schema'
import { useQueryClient } from '@tanstack/react-query'
import { MediaUpload } from '../../../../../components/media-upload'
import { Product } from '@/types/types'

// Default values for the form
const defaultValues: Partial<CreateProductValues> = {
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
  sku: ''
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

const initialState: FormState = {}

interface UpdateProductFormProps {
  initialData: Product
}

export function UpdateProductForm({ initialData }: UpdateProductFormProps) {
  const router = useRouter()
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [openBreed, setOpenBreed] = useState(false)
  const [isSubmitting, startTransition] = useTransition()
  const [state, formAction, isPending] = useActionState(
    createProductAction,
    initialState
  )
  const [files, setFiles] = useState<File[]>([])

  const form = useForm<UpdateProductValues>({
    resolver: zodResolver(UpdateProductSchema),
    defaultValues
  })

  const queryClient = useQueryClient()

  // Update the form's tags field when selectedTags changes
  useEffect(() => {
    form.setValue('tags', selectedTags)
  }, [selectedTags, form])

  useEffect(() => {
    if (state?.message) {
      if (state.success) {
        queryClient.invalidateQueries({ queryKey: ['products'] })
        toast.success(state.message)

        form.reset(defaultValues)
        setSelectedTags([])

        setTimeout(() => {
          router.push('/vendor-marketplace/products')
        }, 1500)
      } else {
        toast.error(state.message)
      }
    }
  }, [state, form, router])

  async function onSubmit(data: CreateProductValues) {
    const formData = new FormData()

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'tags' && Array.isArray(value)) {
          formData.append(key, JSON.stringify(value))
        } else if (key === 'availableDate' && value instanceof Date) {
          formData.append(key, value.toISOString())
        } else {
          formData.append(key, String(value))
        }
      }

      files.forEach((file, index) => {
        formData.append(`media[${index}]`, file)
      })
    })

    startTransition(() => {
      formAction(formData)
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        {state?.errors && Object.keys(state.errors).length > 0 && (
          <Alert variant='destructive'>
            <AlertTitle>Validation Error</AlertTitle>
            <AlertDescription>
              <ul className='list-disc pl-5'>
                {Object.entries(state.errors).map(([field, errors]) =>
                  errors?.map((error, i) => (
                    <li key={`${field}-${i}`}>{error}</li>
                  ))
                )}
              </ul>
            </AlertDescription>
          </Alert>
        )}

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
                    <MediaUpload form={form} maxFiles={5} />
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
            onClick={() => router.push('/vendor-marketplace/products')}
          >
            Cancel
          </Button>
          <Button type='submit' disabled={isPending}>
            {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {isPending ? 'Saving...' : 'Save Product'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
