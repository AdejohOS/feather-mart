import React from 'react'
import { ProductForm } from '../_components/product-form'
import { ArrowLeft, PlusCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import Link from 'next/link'

const page = () => {
  return (
    <div className='w-full space-y-7'>
      <Button variant='outline'>
        <Link
          href='/vendor-marketplace/products'
          className='flex items-center gap-2'
        >
          <ArrowLeft className='size-4' />
          Back to Products
        </Link>
      </Button>
      <h1 className='mb-6 flex items-center gap-3 text-3xl font-bold'>
        Add New Poultry Product <PlusCircle className='size-6' />
      </h1>
      <ProductForm />
    </div>
  )
}

export default page
