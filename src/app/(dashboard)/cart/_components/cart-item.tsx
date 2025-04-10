import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Currency from '@/components/ui/currency'
import { DottedSeparator } from '@/components/ui/dotted-separator'
import { Separator } from '@/components/ui/separator'
import { Minus, Plus, Trash } from 'lucide-react'
import Image from 'next/image'
import type { CartItem as CartItemType } from '@/app/(dashboard)/cart/actions'
import { useState } from 'react'
import { useCart } from './cart-provider'
import { formatCurrency } from '@/lib/utils'
import { Input } from '@/components/ui/input'

interface CartItemProps {
  item: CartItemType
}

export const CartItem = ({ item }: CartItemProps) => {
  const [quantity, setQuantity] = useState(item.quantity)
  const { updateCartItem, removeCartItem, isLoading } = useCart()

  const handleUpdateQuantity = async (newQuantity: number) => {
    if (isLoading) return

    // Update local state immediately for better UX
    setQuantity(newQuantity)

    try {
      // For both authenticated and anonymous users
      await updateCartItem(item.id, newQuantity, item.product_id)
    } catch (error) {
      // Revert to original quantity on error
      setQuantity(item.quantity)
      console.error('Error updating cart item:', error)
    }
  }

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value)
    if (!isNaN(value) && value > 0) {
      setQuantity(value)
      handleUpdateQuantity(value)
    }
  }

  const handleRemove = async () => {
    if (isLoading) return

    try {
      // For both authenticated and anonymous users
      await removeCartItem(item.id, item.product_id)
    } catch (error) {
      console.error('Error removing cart item:', error)
    }
  }

  const productImage =
    item.product.media && item.product.media.length > 0
      ? item.product.media[0].url
      : '/placeholder.svg?height=100&width=100'

  const itemTotal = quantity * item.product.price

  return (
    <Card className='basis-4/6 p-4 text-gray-500'>
      <h2 className='text-xl font-bold'>My Cart (2)</h2>

      <DottedSeparator className='my-4' />
      <div className=''>
        <div className='space-y-4'>
          <div className='flex justify-between gap-3'>
            <div className='flex flex-1 gap-3'>
              <div className='relative aspect-square h-10 w-10 overflow-hidden rounded-md sm:h-20 sm:w-20'>
                <Image
                  src={productImage || '/placeholder.svg'}
                  alt='product-name'
                  fill
                  className='object-cover'
                />
              </div>
              <div>
                <p className='text-lg font-semibold'>{item.product.name}</p>
                <p>
                  Seller: <span>Mai Samari Farms</span>
                </p>
                <p className='text-sm'>In stock</p>
              </div>
            </div>
            <div>
              <p> {formatCurrency(itemTotal)}</p>
            </div>
          </div>
          <div className='flex items-center justify-between gap-3'>
            <Button
              variant='destructive'
              className='flex items-center gap-2'
              size='sm'
              onClick={handleRemove}
              disabled={isLoading}
            >
              <Trash className='size-4' /> Remove
            </Button>

            <div className='flex items-center gap-4'>
              <Button
                variant='secondary'
                size='icon'
                onClick={() => handleUpdateQuantity(Math.max(1, quantity - 1))}
                disabled={isLoading || quantity <= 1}
              >
                <Minus className='size-4' />
              </Button>
              <Input
                type='number'
                min='1'
                value={quantity}
                onChange={handleQuantityChange}
                className='h-8 w-14 text-center'
                disabled={isLoading}
              />
              <Button
                size='icon'
                onClick={() => handleUpdateQuantity(quantity + 1)}
                disabled={isLoading}
              >
                <Plus className='size-4' />
              </Button>
            </div>
          </div>
        </div>

        <Separator className='my-4' />
      </div>
    </Card>
  )
}
