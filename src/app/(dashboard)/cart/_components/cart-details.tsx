'use client'

import { createClient } from '@/utils/supabase/client'

import { getCart, type CartSummary as CartSummaryType } from '../actions'
import { EmptyCart } from './empty-cart'
import { CartItem } from './cart-item'

import { useCart } from './cart-provider'
import { useEffect, useState } from 'react'
import { CartContentSkeleton } from '@/components/skeleton/cart-content-skeleton'
import { CartSummary } from './cart-summary'

export const CartDetails = () => {
  const { cart, isLoading } = useCart()
  const [serverCart, setServerCart] = useState<CartSummaryType | null>(null)
  const [isServerLoading, setIsServerLoading] = useState(true)

  useEffect(() => {
    // Fetch server cart data
    const fetchServerCart = async () => {
      try {
        const cartData = await getCart()
        setServerCart(cartData)
      } catch (error) {
        console.error('Error fetching cart:', error)
      } finally {
        setIsServerLoading(false)
      }
    }

    fetchServerCart()
  }, [])

  // Show loading state while fetching cart data
  if (isLoading || isServerLoading) {
    return <CartContentSkeleton />
  }

  // Use server cart if available (for authenticated users)
  const cartToUse =
    serverCart && serverCart.items && serverCart.items.length > 0
      ? serverCart
      : cart

  if (!cartToUse || !cartToUse.items || cartToUse.items.length === 0) {
    return <EmptyCart />
  }

  return (
    <div className='grid gap-8 md:grid-cols-3'>
      <div className='md:col-span-2'>
        <div className='space-y-1'>
          {cartToUse?.items.map(item => <CartItem key={item.id} item={item} />)}
        </div>
      </div>

      <div className='md:col-span-1'>
        <CartSummary />
      </div>
    </div>
  )
}
