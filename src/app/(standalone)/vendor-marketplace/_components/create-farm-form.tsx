'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { DottedSeparator } from '@/components/ui/dotted-separator'
import { Input } from '@/components/ui/input'

import { Textarea } from '@/components/ui/textarea'
import { Country, State } from 'country-state-city'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select'

import { useEffect, useState, useTransition } from 'react'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import { Check, ChevronsUpDown, Loader, X } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { HousingSystem, PoultryType } from '@/types/types'
import { Badge } from '@/components/ui/badge'
import {
  CreateFarmSchema,
  CreateFarmValues
} from '@/features/vendor/vendor-schema'
import { createFarmAction } from '@/features/action'
import { useRouter } from 'next/navigation'
import { FileUpload } from './file-upload'

export const CreateFarmForm = () => {
  const router = useRouter()
  const [step, setStep] = useState(1)

  const [countries, setCountries] = useState<any[]>([])
  const [states, setStates] = useState<any[]>([])
  const [openCountry, setOpenCountry] = useState(false)
  const [openState, setOpenState] = useState(false)

  const [selectedCountryCode, setSelectedCountryCode] = useState('+234')

  const form = useForm<CreateFarmValues>({
    resolver: zodResolver(CreateFarmSchema),
    defaultValues: {
      name: '',
      country: '',
      state: '',
      address: '',
      description: '',
      phone_number: '',
      website: '',
      farmEmail: '',
      poultryType: PoultryType.Layers,
      capacity: 100,
      housingSystem: HousingSystem.BatteryCages,
      certifications: [],
      media: []
    }
  })

  const watchCountry = form.watch('country')

  useEffect(() => {
    const allCountries = Country.getAllCountries()
    setCountries(allCountries)
  }, [])

  useEffect(() => {
    if (watchCountry) {
      const countryStates = State.getStatesOfCountry(watchCountry)
      setStates(countryStates)
      // Reset state selection when country changes
      form.setValue('state', '')
    }
  }, [watchCountry, form])

  const handlePhoneNumberChange = (countryCode: string, phonePart: string) => {
    const fullNumber = phonePart.startsWith(countryCode)
      ? phonePart
      : `${countryCode}${phonePart}`
    form.setValue('phone_number', fullNumber, { shouldValidate: true })
  }

  // Create a type for your form fields
  type FormField = keyof CreateFarmValues

  // Then use it in your validation
  const validateStep = async (stepNumber: number) => {
    const fields: FormField[] =
      stepNumber === 1
        ? [
            'name',

            'country',
            'state',
            'address',
            'phone_number',
            'farmEmail',
            'website'
          ]
        : [
            'poultryType',
            'capacity',
            'housingSystem',
            'certifications',
            'media'
          ]

    return form.trigger(fields)
  }
  const handleNext = async () => {
    const isValid = await validateStep(1)
    if (isValid) setStep(2)
  }

  const handleBack = () => setStep(1)

  const [isPending, startTransition] = useTransition()

  const onSubmit = async (data: CreateFarmValues) => {
    startTransition(async () => {
      const result = await createFarmAction(data)

      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('Farm created successfully!')
      }
    })
  }

  const onCancel = () => {
    router.push('/vendor-marketplace/settings')
  }

  return (
    <Card>
      <CardHeader className='text-center'>
        <CardTitle>Create farm</CardTitle>
        <CardDescription>
          Fill out form to create a new farm record.
        </CardDescription>
      </CardHeader>
      <div className='px-7'>
        <DottedSeparator />
      </div>
      <CardContent className='p-7'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {step === 1 && (
              <div className='space-y-4'>
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Farm Name:</FormLabel>
                      <FormControl>
                        <Input placeholder='Enter farm name' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='flex gap-x-4'>
                  <FormField
                    control={form.control}
                    name='country'
                    render={({ field }) => (
                      <FormItem className='flex w-1/2 flex-col'>
                        <FormLabel>Country</FormLabel>
                        <Popover
                          open={openCountry}
                          onOpenChange={setOpenCountry}
                        >
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant='outline'
                                role='combobox'
                                aria-expanded={openCountry}
                                className={cn(
                                  'w-full justify-between',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value
                                  ? countries.find(
                                      country => country.isoCode === field.value
                                    )?.name
                                  : 'Select country'}
                                <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className='w-full p-0'>
                            <Command>
                              <CommandInput placeholder='Search country...' />
                              <CommandList>
                                <CommandEmpty>No country found.</CommandEmpty>
                                <CommandGroup className='max-h-[300px] overflow-y-auto'>
                                  {countries.map(country => (
                                    <CommandItem
                                      key={country.isoCode}
                                      value={country.name}
                                      onSelect={() => {
                                        form.setValue(
                                          'country',
                                          country.isoCode
                                        )
                                        setOpenCountry(false)
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          'mr-2 h-4 w-4',
                                          country.isoCode === field.value
                                            ? 'opacity-100'
                                            : 'opacity-0'
                                        )}
                                      />
                                      {country.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='state'
                    render={({ field }) => (
                      <FormItem className='flex w-1/2 flex-col'>
                        <FormLabel>State / Province</FormLabel>
                        <Popover open={openState} onOpenChange={setOpenState}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant='outline'
                                role='combobox'
                                aria-expanded={openState}
                                className={cn(
                                  'w-full justify-between',
                                  !field.value && 'text-muted-foreground'
                                )}
                                disabled={!watchCountry}
                              >
                                {field.value && states.length > 0
                                  ? states.find(
                                      state => state.isoCode === field.value
                                    )?.name
                                  : 'Select state'}
                                <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className='w-full p-0'>
                            <Command>
                              <CommandInput placeholder='Search state...' />
                              <CommandList>
                                <CommandEmpty>No state found.</CommandEmpty>
                                <CommandGroup className='max-h-[300px] overflow-y-auto'>
                                  {states.map(state => (
                                    <CommandItem
                                      key={state.isoCode}
                                      value={state.name}
                                      onSelect={() => {
                                        form.setValue('state', state.isoCode)
                                        setOpenState(false)
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          'mr-2 h-4 w-4',
                                          state.isoCode === field.value
                                            ? 'opacity-100'
                                            : 'opacity-0'
                                        )}
                                      />
                                      {state.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          {!watchCountry
                            ? 'Please select a country first'
                            : states.length === 0
                              ? 'No states available for the selected country'
                              : 'Select your state or province'}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name='address'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address:</FormLabel>
                      <FormControl>
                        <Input placeholder='Enter farm address...' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='description'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Farm Description:</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='Describe your business...'
                          {...field}
                          className='resize-none'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='phone_number'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <div className='flex gap-x-4'>
                        <Select
                          value={selectedCountryCode}
                          onValueChange={value => {
                            setSelectedCountryCode(value)
                            handlePhoneNumberChange(
                              value,
                              field.value.replace(/^\+\d{3}/, '')
                            )
                          }}
                        >
                          <SelectTrigger className='w-[180px]'>
                            <SelectValue placeholder='Country code' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='+234'>
                              <span className='flex items-center gap-2'>
                                <span className='font-medium'>Ng</span>
                                <span className='text-muted-foreground'>
                                  (+234)
                                </span>
                              </span>
                            </SelectItem>
                            <SelectItem value='+233'>
                              <span className='flex items-center gap-2'>
                                <span className='font-medium'>Gh</span>
                                <span className='text-muted-foreground'>
                                  (+233)
                                </span>
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>

                        <FormControl>
                          <Input
                            {...field}
                            value={field.value.replace(/^\+\d{3}/, '')}
                            onChange={e =>
                              handlePhoneNumberChange(
                                selectedCountryCode,
                                e.target.value
                              )
                            }
                            placeholder={
                              selectedCountryCode === '+234'
                                ? '7012345678'
                                : '231234567'
                            }
                            inputMode='numeric'
                          />
                        </FormControl>
                      </div>
                      <FormDescription>
                        {selectedCountryCode === '+234'
                          ? 'Nigeria (Ng): 10 digits starting with 7, 8, or 9'
                          : 'Ghana (Gh): 9 digits starting with 2, 3, or 5'}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='farmEmail'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Farm Email:</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter farm email'
                          {...field}
                          type='email'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='website'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Farm Website:</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter farm website'
                          {...field}
                          type='url'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='flex justify-end gap-x-3'>
                  <Button variant='outline' type='button' onClick={onCancel}>
                    Cancel
                  </Button>
                  <Button onClick={handleNext} type='button'>
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className='space-y-3'>
                <div className='grid grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='poultryType'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Poultry Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select poultry type' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(PoultryType).map(value => (
                              <SelectItem key={value} value={value}>
                                {value}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='capacity'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stocking Capacity</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            {...field}
                            onChange={e =>
                              field.onChange(Number(e.target.value))
                            }
                            placeholder='Total birds capacity'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name='housingSystem'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Housing System</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select housing system' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(HousingSystem).map(value => (
                            <SelectItem key={value} value={value}>
                              {value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='certifications'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Certifications:</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Add certifications (comma separated)'
                          value={field.value?.join(', ') || ''}
                          onChange={e =>
                            field.onChange(e.target.value.split(/,\s*/))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                      <div className='mt-2 flex flex-wrap gap-2'>
                        {field.value?.map((cert, index) => (
                          <Badge key={index} variant='secondary'>
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='media'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Images & Videos</FormLabel>
                      <FormDescription>
                        Upload images and videos (max 10 files)
                      </FormDescription>
                      <FormControl>
                        <FileUpload
                          onFilesChange={field.onChange}
                          value={field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='flex justify-end gap-x-3'>
                  <Button
                    variant='outline'
                    type='button'
                    onClick={handleBack}
                    disabled={isPending}
                  >
                    Back
                  </Button>
                  <Button
                    type='submit'
                    disabled={isPending}
                    className='flex items-center gap-2'
                  >
                    {isPending && <Loader className='size-4 animate-spin' />}
                    {isPending ? 'Creating' : 'Create farm'}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
