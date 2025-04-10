'use client'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { useGetProducts } from '@/hooks/general-app/use-products'
import { Heart, Info, RefreshCcw, ShoppingCart, Star } from 'lucide-react'
import { AddToCartButton } from '../cart/_components/add-to-cart-button'

export const FeaturedProducts = () => {
  const { data: products, isPending } = useGetProducts()
  return (
    <div className='bg-gray-50'>
      <section className='mx-auto max-w-6xl space-y-4 px-4 py-16'>
        <div>
          <h2 className='text-3xl font-bold'>
            Featured <span className='text-teal-600'>Products</span>
          </h2>
          <div className='flex flex-col justify-between gap-3 md:flex-row'>
            <p>Handpicked selections from our trusted farmers</p>
            <div className='flex gap-x-2'>
              <Button size='sm' variant='ghost' className='bg-gray-100'>
                All
              </Button>
              <Button size='sm' variant='ghost'>
                Live Poultry
              </Button>
              <Button size='sm' variant='ghost'>
                Eggs
              </Button>
              <Button size='sm' variant='ghost'>
                Meat
              </Button>
              <Button size='sm' variant='ghost'>
                Feed Supplement
              </Button>
              <Button size='sm' variant='ghost'>
                Equipments
              </Button>
            </div>
          </div>
        </div>

        {isPending && (
          <div className='mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5'>
            <div className='flex flex-col space-y-3'>
              <Skeleton className='h-[125px] w-full rounded-xl' />
              <div className='space-y-2'>
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-[200px]' />
                <Skeleton className='h-4 w-[200px]' />
              </div>
              <Skeleton className='h-4 w-full' />
            </div>
            <div className='flex flex-col space-y-3'>
              <Skeleton className='h-[125px] w-full rounded-xl' />
              <div className='space-y-2'>
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-[200px]' />
                <Skeleton className='h-4 w-[200px]' />
              </div>
              <Skeleton className='h-4 w-full' />
            </div>
            <div className='flex flex-col space-y-3'>
              <Skeleton className='h-[125px] w-full rounded-xl' />
              <div className='space-y-2'>
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-[200px]' />
                <Skeleton className='h-4 w-[200px]' />
              </div>
              <Skeleton className='h-4 w-full' />
            </div>
            <div className='flex flex-col space-y-3'>
              <Skeleton className='h-[125px] w-full rounded-xl' />
              <div className='space-y-2'>
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-[200px]' />
                <Skeleton className='h-4 w-[200px]' />
              </div>
              <Skeleton className='h-4 w-full' />
            </div>
            <div className='flex flex-col space-y-3'>
              <Skeleton className='h-[125px] w-full rounded-xl' />
              <div className='space-y-2'>
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-[200px]' />
                <Skeleton className='h-4 w-[200px]' />
              </div>
              <Skeleton className='h-4 w-full' />
            </div>
          </div>
        )}
        <div className='mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5'>
          {products?.map(product => (
            <div
              key={product.id}
              className='overflow-hidden rounded-md border transition hover:shadow-md'
            >
              <div className='group relative'>
                <div className='absolute left-2 top-2 rounded bg-rose-400 px-2 py-1 text-xs font-bold text-white'>
                  SALE
                </div>
                <img
                  src={product.image}
                  alt='Free Range Chicken'
                  className='h-48 w-full object-contain p-4'
                />
                <div className='absolute right-2'>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          aria-label='Add to wishlist'
                          variant='outline'
                          className=''
                          size='icon'
                        >
                          <Heart className='size-4' />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Add to wishlist</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              <div className='p-4'>
                <div className='text-sm text-gray-500'>{product.category}</div>
                <h3 className='mt-1 font-medium text-gray-800'>
                  {product.name} {product.weight}
                </h3>
                <div className='mt-2 flex'>
                  {[1, 2, 3, 4].map(i => (
                    <Star
                      key={i}
                      className='h-4 w-4 fill-amber-400 text-amber-400'
                    />
                  ))}
                  <Star className='h-4 w-4 text-gray-300' />
                </div>
                <div className='mt-2 flex items-center'>
                  <span className='font-bold text-gray-800'>
                    ${product.discount_price}
                  </span>
                  <span className='ml-2 text-sm text-gray-500 line-through'>
                    ${product.price}
                  </span>
                </div>
                <AddToCartButton productId={product.id} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
