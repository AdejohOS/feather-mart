'use client'

import { useEffect, useState } from 'react'
import { useCart } from './cart-provider'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Check, Loader, ShoppingCart } from 'lucide-react'
import { useGetProduct } from '@/hooks/use-products'
import { getProductAction, getProductDetails } from '../actions'

interface AddToCartButtonProps {
  productId: string
}
export const AddToCartButton = ({ productId }: AddToCartButtonProps) => {
  const [isAdded, setIsAdded] = useState(false)
  const { addToCart, isLoading, cart } = useCart()

  // Fetch product details (needed for anonymous cart)

  const isInCart = cart.items.some(item => item.product_id === productId)

  const { data: product, isLoading: isProductLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => getProductDetails(productId)
  })

  const handleAddToCart = async () => {
    if (!product) {
      console.error('Product details not available')
      return
    }
    try {
      // Always add quantity of 1 from product page
      await addToCart(productId, 1, product)

      setIsAdded(true)

      // Reset the "Added" state after 2 seconds
      setTimeout(() => {
        setIsAdded(false)
      }, 2000)
    } catch (error) {
      console.error('Error adding to cart:', error)
    }
  }

  return (
    <>
      <Button
        className='w-full'
        aria-label='Add to cart'
        onClick={handleAddToCart}
        disabled={isLoading || isAdded || isProductLoading}
      >
        {isLoading ? (
          <>
            <Loader className='mr-2 h-4 w-4 animate-spin' />
            Adding...
          </>
        ) : isAdded ? (
          <>
            <Check className='mr-2 h-4 w-4' />
            Added to Cart
          </>
        ) : isInCart ? (
          <>
            <Check className='mr-2 h-4 w-4' />
            In Cart • Add Again
          </>
        ) : (
          <>
            <ShoppingCart className='mr-2 h-4 w-4' />
            Add to Cart
          </>
        )}
      </Button>
    </>
  )
}
