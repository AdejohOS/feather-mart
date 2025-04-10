'use client'

import { ProductMedia } from './product-media'
import { notFound } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { ArrowLeft, MapPin, Tag } from 'lucide-react'
import { useGetProduct } from '@/hooks/use-products'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { formatDistanceToNow } from 'date-fns'

interface ProductDetailsProps {
  productId: string
}

export const ProductDetails = ({ productId }: ProductDetailsProps) => {
  const { data: product, isLoading, error } = useGetProduct(productId)

  if (error) {
    console.error('Error fetching product:', error?.message || error)
    notFound()
  }

  if (isLoading) {
    return (
      <div className='container py-10'>
        <div className='grid gap-8 md:grid-cols-2'>
          <div>
            <Skeleton className='aspect-square w-full' />
          </div>

          <div className='space-y-6'>
            <div>
              <Skeleton className='mb-2 h-10 w-3/4' />
              <Skeleton className='h-4 w-1/2' />
            </div>

            <Skeleton className='h-8 w-1/3' />

            <Separator />

            <div className='space-y-4'>
              <Skeleton className='mb-2 h-6 w-1/4' />
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-3/4' />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <Skeleton className='h-24 w-full' />
              <Skeleton className='h-24 w-full' />
            </div>

            <Skeleton className='mt-6 h-12 w-full' />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    notFound()
  }

  const formattedDate = product.available_date
    ? new Date(product.available_date).toLocaleDateString()
    : null

  const createdDate = formatDistanceToNow(new Date(product.created_at), {
    addSuffix: true
  })

  return (
    <div className='flex flex-col gap-10 md:flex-row md:justify-between lg:gap-20'>
      <ProductMedia
        media={
          product.media?.map(item => ({
            id: item.id,
            url: item.url,
            type: item.type as 'image' | 'video'
          })) || []
        }
      />
      <div className='basis-4/6 space-y-5'>
        <div className='space-y-6'>
          <div>
            <div className='flex items-center justify-between'>
              <h1 className='text-3xl font-bold'>{product.name}</h1>
              <Badge variant={product.is_available ? 'default' : 'secondary'}>
                {product.is_available ? 'Available' : 'Unavailable'}
              </Badge>
            </div>

            <div className='mt-2 flex items-center text-sm text-muted-foreground'>
              <span>Added {createdDate}</span>
              {product.farms && (
                <>
                  <span className='mx-2'>•</span>
                  <MapPin className='mr-1 h-3 w-3' />
                  <span>{product.farms.name}</span>
                </>
              )}
            </div>
          </div>

          <div className='flex items-baseline gap-2'>
            <span className='text-3xl font-bold'>
              ${product.discount_price || product.price}
            </span>
            {product.discount_price && (
              <span className='text-xl text-muted-foreground line-through'>
                ${product.price}
              </span>
            )}
            <span className='ml-1 text-sm text-muted-foreground'>
              per {product.unit}
            </span>
          </div>

          <div className='space-y-2'>
            <div className='flex flex-wrap gap-2'>
              <Badge variant='outline'>{product.category}</Badge>
              {product.breed && (
                <Badge variant='outline'>{product.breed}</Badge>
              )}
              {product.is_organic && (
                <Badge variant='outline' className='bg-green-50'>
                  Organic
                </Badge>
              )}
              {product.is_free_range && (
                <Badge variant='outline' className='bg-blue-50'>
                  Free Range
                </Badge>
              )}
              {product.is_antibiotic && (
                <Badge variant='outline' className='bg-purple-50'>
                  Antibiotic-Free
                </Badge>
              )}
              {product.is_hormone && (
                <Badge variant='outline' className='bg-yellow-50'>
                  Hormone-Free
                </Badge>
              )}
              {product.is_vaccinated && (
                <Badge variant='outline' className='bg-teal-50'>
                  Vaccinated
                </Badge>
              )}
            </div>
          </div>

          <Separator />

          <div className='space-y-4'>
            <h2 className='text-xl font-semibold'>Description</h2>
            <p className='whitespace-pre-line text-muted-foreground'>
              {product.description}
            </p>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <Card>
              <CardContent className='p-4'>
                <div className='text-sm font-medium'>Stock</div>
                <div className='mt-1 text-2xl font-bold'>{product.stock}</div>
                <div className='mt-1 text-xs text-muted-foreground'>
                  {product.minimum_order &&
                    `Min. order: ${product.minimum_order}`}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-4'>
                <div className='text-sm font-medium'>Available</div>
                <div className='mt-1 text-lg font-bold'>
                  {formattedDate || 'Now'}
                </div>
                <div className='mt-1 text-xs text-muted-foreground'>
                  {product.sku && `SKU: ${product.sku}`}
                </div>
              </CardContent>
            </Card>
          </div>

          {(product.age || product.weight) && (
            <div className='grid grid-cols-2 gap-4'>
              {product.age && (
                <div>
                  <h3 className='text-sm font-medium'>Age</h3>
                  <p>{product.age}</p>
                </div>
              )}

              {product.weight && (
                <div>
                  <h3 className='text-sm font-medium'>Weight</h3>
                  <p>{product.weight}</p>
                </div>
              )}
            </div>
          )}

          {product.tags && product.tags.length > 0 && (
            <div>
              <h3 className='mb-2 text-sm font-medium'>Tags</h3>
              <div className='flex flex-wrap gap-2'>
                {product.tags.map((tag: string, index: number) => (
                  <Badge key={index} variant='secondary'>
                    <Tag className='mr-1 h-3 w-3' />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {(product.nutritional_info ||
            product.storage_instructions ||
            product.origin) && (
            <>
              <Separator />

              <div className='space-y-4'>
                <h2 className='text-xl font-semibold'>
                  Additional Information
                </h2>

                {product.nutritional_info && (
                  <div>
                    <h3 className='text-sm font-medium'>
                      Nutritional Information
                    </h3>
                    <p className='mt-1 whitespace-pre-line text-muted-foreground'>
                      {product.nutritional_info}
                    </p>
                  </div>
                )}

                {product.storage_instructions && (
                  <div>
                    <h3 className='text-sm font-medium'>
                      Storage Instructions
                    </h3>
                    <p className='mt-1 whitespace-pre-line text-muted-foreground'>
                      {product.storage_instructions}
                    </p>
                  </div>
                )}

                {product.origin && (
                  <div>
                    <h3 className='text-sm font-medium'>Origin</h3>
                    <p className='mt-1 text-muted-foreground'>
                      {product.origin}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          <div className='pt-4'>
            <Button size='lg' className='w-full'>
              Contact Seller
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
