'use client'

import { Button } from '@/components/ui/button'
import Currency from '@/components/ui/currency'
import { Card } from '@/components/ui/card'
import { DottedSeparator } from '@/components/ui/dotted-separator'
import { useCart } from './cart-provider'
import { useMemo } from 'react'
import { formatCurrency } from '@/lib/utils'

export const CartSummary = () => {
  const { cart, isLoading } = useCart()

  // Calculate cart totals
  const { subtotal, tax, total, totalItems } = useMemo(() => {
    // Calculate subtotal
    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    )

    // Calculate estimated tax (example: 8%)
    const taxRate = 0.08
    const tax = subtotal * taxRate

    // Calculate total
    const total = subtotal + tax

    // Calculate total items
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0)

    return { subtotal, tax, total, totalItems }
  }, [cart.items])

  return (
    <Card className='h-fit basis-2/6 p-4 text-gray-500 md:sticky md:top-40'>
      <h2 className='text-lg font-bold'>Order Summary</h2>
      <DottedSeparator className='my-4' />
      <div className='flex items-center justify-between'>
        <p>SubTotal</p>
        {formatCurrency(total)}
      </div>
      <Button className='mt-6 w-full'>Checkout {formatCurrency(total)}</Button>
    </Card>
  )
}
