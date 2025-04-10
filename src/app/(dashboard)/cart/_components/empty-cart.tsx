import { ShoppingCart, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function EmptyCart() {
  return (
    <div className='flex flex-col items-center justify-center py-12'>
      <div className='mb-4 rounded-full bg-muted p-6'>
        <ShoppingCart className='h-10 w-10 text-muted-foreground' />
      </div>
      <h2 className='mb-2 text-2xl font-semibold'>Your cart is empty</h2>
      <p className='mb-6 max-w-md text-center text-muted-foreground'>
        Looks like you haven't added any products to your cart yet. Browse our
        products and find something you like!
      </p>
      <Link href='/products'>
        <Button size='lg'>
          Browse Products
          <ArrowRight className='ml-2 h-4 w-4' />
        </Button>
      </Link>
    </div>
  )
}
