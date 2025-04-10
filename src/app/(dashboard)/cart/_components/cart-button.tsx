'use client'

import { Loader, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { useCart } from './cart-provider'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export const CartButton = () => {
  const { cart, isLoading } = useCart()
  const [animateBadge, setAnimateBadge] = useState(false)
  const [prevCount, setPrevCount] = useState(0)

  useEffect(() => {
    if (cart.totalItems > prevCount) {
      setAnimateBadge(true)
      const timer = setTimeout(() => setAnimateBadge(false), 300)
      return () => clearTimeout(timer)
    }
    setPrevCount(cart.totalItems)
  }, [cart.totalItems, prevCount])

  return (
    <Link href='/cart'>
      <button className='relative'>
        {isLoading ? (
          <Loader className='h-5 w-5 animate-spin' />
        ) : (
          <ShoppingCart className='size-8' />
        )}
        {!isLoading && cart.totalItems > 0 && (
          <Badge
            variant='destructive'
            className={`absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center p-0 text-xs transition-transform ${
              animateBadge ? 'scale-125' : 'scale-100'
            }`}
          >
            {cart.totalItems > 99 ? '99+' : cart.totalItems}
          </Badge>
        )}
      </button>
    </Link>
  )
}
