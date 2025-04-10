import React, { Suspense } from 'react'
import { CartDetails } from './_components/cart-details'
import { CartContentSkeleton } from '@/components/skeleton/cart-content-skeleton'

const page = () => {
  return (
    <section className='bg-gray-100'>
      <div className='mx-auto max-w-6xl px-4 pb-16 pt-4'>
        <Suspense fallback={<CartContentSkeleton />}>
          <CartDetails />
        </Suspense>
      </div>
    </section>
  )
}

export default page
